// CONSTANTS
const FOLDER_NAME = 'three-sixty-automation'
const TEAM_SHEET_NAME = 'teams'
const DEFAULT_SHEET_NAME = 'Sheet1'

// SERVING THE USER INTERFACE
const doGet = () => HtmlService.createTemplateFromFile('index').evaluate();

const include = (filename: string) => HtmlService
  .createHtmlOutputFromFile(filename)
  .getContent();

// ADMIN
function getOrCreateWorkingFolder() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME)
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME)
}

function getOrCreateTeamSpreadsheet(folder) {
  const files = folder.getFilesByName(TEAM_SHEET_NAME)
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next())
  }
  const ss = SpreadsheetApp.create(TEAM_SHEET_NAME)
  const temp = DriveApp.getFileById(ss.getId())
  folder.addFile(temp)
  DriveApp.getRootFolder().removeFile(temp)
  return ss
}

//TODO remove duplication from these two functions as they solidify
function matrixToViewModel(sheet) {
  const teamName = sheet.getName()
  const members = sheet.getDataRange().getValues().map(row => ({
    firstName: row[0],
    lastName: row[1],
    email: row[2] 
  }))
  return {
    teamName,
    members
  }
}

function getTeams(): object {
  return getOrCreateTeamSpreadsheet(getOrCreateWorkingFolder())
    .getSheets()
    .filter(sheet => sheet.getName() !==  DEFAULT_SHEET_NAME)
    .map(sheet => matrixToViewModel(sheet))
}

function addTeam(teamName: string): object {
  const teamSpreadSheet = getOrCreateTeamSpreadsheet(getOrCreateWorkingFolder())
  teamSpreadSheet.insertSheet(teamName)
  return getTeams()
}

function removeTeam(teamName: string): object {
  const teamSpreadSheet = getOrCreateTeamSpreadsheet(getOrCreateWorkingFolder())
  teamSpreadSheet.deleteSheet(teamSpreadSheet.getSheetByName(teamName))
  return getTeams()
}

function addPerson({ firstName, lastName, email, team }): object {
  Logger.log(firstName, lastName, email, team)
  getOrCreateTeamSpreadsheet(getOrCreateWorkingFolder())
    .getSheetByName(team)
    .appendRow([firstName, lastName, email])
  return getTeams()
}

function removePerson({ firstName, lastName, teamName }): object {
  const teamSheet = getOrCreateTeamSpreadsheet(getOrCreateWorkingFolder())
    .getSheetByName(teamName)
  const teamData = teamSheet.getDataRange().getValues()
  const index = teamData.map(row => row.slice(0, 2).join(''))
    .indexOf(`${firstName}${lastName}`)
  teamSheet.deleteRow(index + 1)
  return getTeams()
}
