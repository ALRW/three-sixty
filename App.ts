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

function getOrCreateTeamSheet(folder) {
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
function getTeams() {
  const teamSpreadSheet = getOrCreateTeamSheet(getOrCreateWorkingFolder())
  return teamSpreadSheet.getSheets()
    .filter(sheet => sheet.getName() !==  DEFAULT_SHEET_NAME)
    .map(sheet => sheet.getName())
}

function addTeam(teamName: string): string[] {
  const teamSpreadSheet = getOrCreateTeamSheet(getOrCreateWorkingFolder())
  teamSpreadSheet.insertSheet(teamName)
  return teamSpreadSheet.getSheets()
    .filter(sheet => sheet.getName() !==  DEFAULT_SHEET_NAME)
    .map(sheet => sheet.getName())
}

function removeTeam(teamName: string) {
  const teamSpreadSheet = getOrCreateTeamSheet(getOrCreateWorkingFolder())
  teamSpreadSheet.deleteSheet(teamSpreadSheet.getSheetByName(teamName))
  return teamSpreadSheet.getSheets()
    .filter(sheet => sheet.getName() !==  DEFAULT_SHEET_NAME)
    .map(sheet => sheet.getName())
}
