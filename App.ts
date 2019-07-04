// CONSTANTS
const FOLDER_NAME = 'three-sixty-automation'
const TEAM_SHEET_NAME = 'teams'
const DEFAULT_SHEET_NAME = 'Sheet1'

// SERVING THE USER INTERFACE
const doGet = () => HtmlService.createTemplateFromFile('index').evaluate();

const include = (filename: string) => HtmlService
  .createHtmlOutputFromFile(filename)
  .getContent();

/*
ADMIN
All of the following functions are used by the admin-page
*/
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

const matrixToViewModel = (sheet) => ({
  teamName: sheet.getName(),
  members: sheet.getDataRange().getValues().map((row: string[]) => ({
    firstName: row[0],
    lastName: row[1],
    email: row[2] 
  }))
})

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

/*
FORM CREATION
The following functions define the creation of the feedback form
*/

const createMultipleChoiceGrid = (form, question, helpText) => form.addGridItem()
  .setTitle(question)
  .setHelpText(helpText)
  .setRows(['You...'])
  .setColumns(['Have room to do more', 'Are spot on', 'Are smashing it'])

function createFeedbackForm(title: string) {
  const form = FormApp.create(title)
  form.addSectionHeaderItem().setTitle('First a little bit about you')
  form.addTextItem().setTitle('What\'s your first name?')
  form.addTextItem().setTitle('What\'s your surname name?')
  form.addPageBreakItem().setTitle('The What')
  //TODO add first section questions
  form.addPageBreakItem().setTitle('The How (Our Values)')
  //TODO add section section questions
  form.addPageBreakItem().setTitle('General Feedback')
  //TODO add final questions
}

