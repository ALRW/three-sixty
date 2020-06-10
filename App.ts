//testing whether imports affects the app script flow
import { Constants } from './namespaces/Constants'
import { Form } from './namespaces/Form'
import { Email } from './namespaces/Email'
import { Results } from './namespaces/Results'
import { Util } from './namespaces/Util'

function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createTemplateFromFile('index').evaluate()
}

function include(filename: string): string {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}

function getOrCreateWorkingFolder(): GoogleAppsScript.Drive.Folder {
  const folders = DriveApp.getFoldersByName(Constants.FOLDER)
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(Constants.FOLDER)
}

function addFileToWorkingFolder (
  folder: GoogleAppsScript.Drive.Folder,
  fileId: string): GoogleAppsScript.Drive.Folder {
  const temp = DriveApp.getFileById(fileId)
  folder.addFile(temp)
  DriveApp.getRootFolder().removeFile(temp)
  return folder
}

function getOrCreateTeamSpreadsheet(
  folder: GoogleAppsScript.Drive.Folder = getOrCreateWorkingFolder()
) {
  const files = folder.getFilesByName(Constants.TEAM_SHEET)
  if (files.hasNext()) return SpreadsheetApp.open(files.next())
  const ss = SpreadsheetApp.create(Constants.TEAM_SHEET)
  addFileToWorkingFolder(folder, ss.getId())
  return ss
}

function getTeams (
  teamSpreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet = getOrCreateTeamSpreadsheet()
): object {
  return teamSpreadSheet
    .getSheets()
    .filter(Util.isNotDefaultSheet)
    .map(Util.matrixToViewModel)
}

function addTeam(teamName: string): object {
  const sanitisedName = teamName.replace(' ', '-')
  const teamSpreadSheet = getOrCreateTeamSpreadsheet()
  teamSpreadSheet.insertSheet(sanitisedName)
  return getTeams(teamSpreadSheet)
}

function removeTeam(teamName: string): object {
  const teamSpreadSheet = getOrCreateTeamSpreadsheet()
  teamSpreadSheet.deleteSheet(teamSpreadSheet.getSheetByName(teamName))
  return getTeams(teamSpreadSheet)
}

function addPerson({ firstName, lastName, email, role, team }): object {
  const lock = LockService.getScriptLock()
  lock.tryLock(15000)
  const folder = getOrCreateWorkingFolder()
  const teamSpreadSheet = getOrCreateTeamSpreadsheet(folder)
  const forms = [
    Form.createFeedbackForm(`${firstName} ${lastName}'s Feedback`, true, role),
    Form.createFeedbackForm(`${firstName} ${lastName}'s Team Feedback`, false, role),
  ]
  const spreadsheets = [
    SpreadsheetApp.create(`${firstName} ${lastName}'s Feedback Results`),
    SpreadsheetApp.create(`${firstName} ${lastName}'s Team Feedback Results`)
  ]
  const {0: personalForm, 1: teamForm} = forms
  const [pfid, tfid, psid, tsid] = [...forms, ...spreadsheets].map(f => f.getId())
  personalForm.setDestination(FormApp.DestinationType.SPREADSHEET, psid)
  teamForm.setDestination(FormApp.DestinationType.SPREADSHEET, tsid)
  forms.forEach(file => addFileToWorkingFolder(folder, file.getId()))
  spreadsheets.forEach(file => addFileToWorkingFolder(folder, file.getId()))
  teamSpreadSheet.getSheetByName(team).appendRow(
    [firstName, lastName, email, pfid, tfid, psid, tsid, role]
  )
  Utilities.sleep(15000)
  lock.releaseLock()
  return getTeams(teamSpreadSheet)
}

function runFeedbackRound (teamName: string): string {
  const folder = getOrCreateWorkingFolder()
  const teamSheet = getOrCreateTeamSpreadsheet(folder).getSheetByName(teamName)
  const team = teamSheet.getDataRange().getValues()
  
  // FIXME find better algorithm for this as it doesn't work
  // if there are more than chunkSize number of people limit the number of forms
  // each person receives
  const chunkSize = team.length > 4 ? 4 : team.length - 1
  const allFeedbackRequests = Util.multiplyArray(team, chunkSize)
  const rotatedPeers = [
    allFeedbackRequests[allFeedbackRequests.length - 1],
    ...allFeedbackRequests.slice(1, allFeedbackRequests.length - 1),
    allFeedbackRequests[0]
  ]
  const teamWithPeers = team.map((person, index) => {
    const startIndex = index * chunkSize
    const endIndex = startIndex + chunkSize
    return [...person, rotatedPeers.slice(startIndex, endIndex)]
  })
  teamWithPeers.forEach(([firstName, lastName, email, pfid, tfid, psid, tsid, role, peers], i, original) => {
    const personalSpreadsheet = SpreadsheetApp.openById(psid)
    const personalResultsSheet = personalSpreadsheet.getSheetByName(Constants.DEFAULT_RESULTS_SHEET)
    const newSheetRequired = personalResultsSheet.getLastRow() > 1
    const numberOfRounds = personalSpreadsheet.getSheets().filter(Util.isNotDefaultSheet).length
    if(newSheetRequired) {
      personalSpreadsheet.insertSheet(`Form Responses ${numberOfRounds + 1}`, {template: personalResultsSheet})
    }
    const teamSpreadSheet = SpreadsheetApp.openById(tsid)
    const teamResultsSheet = teamSpreadSheet.getSheetByName(Constants.DEFAULT_RESULTS_SHEET)
    if(newSheetRequired) {
      teamSpreadSheet.insertSheet(`Form Responses ${numberOfRounds + 1}`, {template: teamResultsSheet})
    }
    const personalFormUrl = FormApp.openById(pfid).getPublishedUrl()
    Email.sendEmail(email, 'New 360 Feedback Round', {firstName, personalFormUrl, peers})
  })
  return teamName
}

function removePerson({ firstName, lastName, teamName }): object {
  const folder = getOrCreateWorkingFolder()
  const teamSpreadSheet = getOrCreateTeamSpreadsheet(folder)
  const teamSheet = teamSpreadSheet.getSheetByName(teamName)
  const rowIndex = Util.getPersonsIndex(teamSheet, firstName, lastName)
  const { 0: docIds } = teamSheet.getRange(rowIndex, 4, 1, 4).getValues()
  docIds.forEach(id => folder.removeFile(DriveApp.getFileById(id)))
  teamSheet.deleteRow(rowIndex)
  return getTeams(teamSpreadSheet)
}

function getFeedbackData (name: string): object {
  try {
    const { 0: firstName, 1: lastName } = name.split(' ')
    const { 0: teamSheet } = getOrCreateTeamSpreadsheet()
      .getSheets()
      .filter(sheet => Util.getPersonsIndex(sheet, firstName, lastName) > 0)
    const { 5: psid, 6: tsid } = teamSheet
      .getDataRange()
      .getValues()[Util.getPersonsIndex(teamSheet, firstName, lastName) - 1]
    return Results.createPayload(psid, tsid, name)
  } catch (error) {
    return Util.errorPayload(`
                             Could not find any data for ${name}.  Ensure you
                             have entered the name in the format: Firstname
                             Lastname
                             `)
  }
}
