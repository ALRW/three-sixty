// CONSTANTS
const FOLDER = 'three-sixty-automation'
const TEAM_SHEET = 'teams'
const DEFAULT_SHEET = 'Sheet1'
const DEFAULT_RESULTS_SHEET = 'Form Responses 1'

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
  const folders = DriveApp.getFoldersByName(FOLDER)
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER)
}

function addFileToWorkingFolder (folder, file) {
  const temp = DriveApp.getFileById(file.getId())
  folder.addFile(temp)
  DriveApp.getRootFolder().removeFile(temp)
  return file
}

function getOrCreateTeamSpreadsheet(folder) {
  const files = folder.getFilesByName(TEAM_SHEET)
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next())
  }
  const ss = SpreadsheetApp.create(TEAM_SHEET)
  return addFileToWorkingFolder(folder, ss)
}

const matrixToViewModel = sheet => ({
  teamName: sheet.getName(),
  members: sheet.getDataRange().getValues().map((row: string[]) => ({
    firstName: row[0],
    lastName: row[1],
    email: row[2]
  }))
})

const getPersonsIndex = (sheet, firstName, lastName) =>
  sheet.getDataRange()
    .getValues()
    .map(row => row.slice(0, 2).join(''))
    .indexOf(`${firstName}${lastName}`) + 1

function getTeams () {
  return getOrCreateTeamSpreadsheet(getOrCreateWorkingFolder())
    .getSheets()
    .filter(sheet => sheet.getName() !==  DEFAULT_SHEET)
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
  const lock = LockService.getScriptLock()
  lock.tryLock(15000)
  const folder = getOrCreateWorkingFolder()
  const forms = [
    createFeedbackForm(`${firstName} ${lastName}'s Feedback`, true),
    createFeedbackForm(`${firstName} ${lastName}'s Team Feedback`, false),
  ]
  const spreadsheets = [
    SpreadsheetApp.create(`${firstName} ${lastName}'s Feedback Results`),
    SpreadsheetApp.create(`${firstName} ${lastName}'s Team Feedback Results`)
  ]
  const {0: personalForm, 1: teamForm} = forms
  const [pfid, tfid, psid, tsid] = [...forms, ...spreadsheets].map(f => f.getId())
  personalForm.setDestination(FormApp.DestinationType.SPREADSHEET, psid)
  teamForm.setDestination(FormApp.DestinationType.SPREADSHEET, tsid)
  forms.forEach(file => addFileToWorkingFolder(folder, file))
  spreadsheets.forEach(file => addFileToWorkingFolder(folder, file))
  getOrCreateTeamSpreadsheet(folder)
    .getSheetByName(team)
    .appendRow([firstName, lastName, email, pfid, tfid, psid, tsid])
  Utilities.sleep(15000)
  lock.releaseLock()
  return getTeams()
}

function runFeedbackRound (teamName: string) {
  const folder = getOrCreateWorkingFolder()
  const teamSheet = getOrCreateTeamSpreadsheet(folder).getSheetByName(teamName)
  const team = teamSheet.getDataRange().getValues()
  team.forEach(([firstName, lastName, email, pfid, tfid, psid, tsid], i , original) =>{
    const restOfTeam = original.filter(([fname, lname]) => firstName !== fname && lastName !== lname)
    const personalSpreadsheet = SpreadsheetApp.openById(psid)
    const personalResultsSheet = personalSpreadsheet.getSheetByName(DEFAULT_RESULTS_SHEET)
    const newSheetRequired = personalResultsSheet.getLastRow() > 1
    const numberOfRounds = personalSpreadsheet.getSheets().filter(sheet => sheet.getName() !== DEFAULT_SHEET).length
    if(newSheetRequired) {
      personalSpreadsheet.insertSheet(`Form Responses ${numberOfRounds + 1}`, {template: personalResultsSheet})
    }
    const teamSpreadSheet = SpreadsheetApp.openById(tsid)
    const teamResultsSheet = teamSpreadSheet.getSheetByName(DEFAULT_RESULTS_SHEET)
    if(newSheetRequired) {
      teamSpreadSheet.insertSheet(`Form Responses ${numberOfRounds + 1}`, {template: teamResultsSheet})
    }
    const personalFormUrl = FormApp.openById(pfid).getPublishedUrl()
    const body = Email.emailBody(firstName, personalFormUrl, restOfTeam)
    Email.sendEmail(email, 'New 360 Feedback Round', body)
  })
  return teamName
}

function removePerson({ firstName, lastName, teamName }): object {
  const folder = getOrCreateWorkingFolder()
  const teamSheet = getOrCreateTeamSpreadsheet(folder).getSheetByName(teamName)
  const rowIndex = getPersonsIndex(teamSheet, firstName, lastName)
  const { 0: docIds } = teamSheet.getRange(rowIndex, 4, 1, 4).getValues()
  docIds.forEach(id => folder.removeFile(DriveApp.getFileById(id)))
  teamSheet.deleteRow(rowIndex)
  return getTeams()
}

/*
FORM CREATION
The following functions define the creation of the feedback form
*/
const createMultipleChoiceGrid = (form, question, helpText) =>
  form.addGridItem()
  .setTitle(question)
  .setHelpText(helpText)
  .setRows(['You...'])
  .setColumns(['Have room to do more', 'Are spot on', 'Are smashing it'])

function createFeedbackForm(title: string, isPersonal: boolean) {
  const youThey = isPersonal ? 'you' : 'they'
  const theWhatQuestions = [
    ['Execution', 'Delivers against commitments with a high degree of accuracy and quality'],
    ['Consistency', 'Continually generates impactful results over extended periods of time'],
    ['Quality', 'Consistently writes production-ready code that is easily testable, understood by others and accounts for edge cases and errors'],
    ['Design & Architecture', 'Architects using accepted patterns, allowing for iterative, autonomous development and future scaling. Anticipates future use, making design decisions that minimise the cost of future changes.']
  ]
  const theHowQuestions = [
    ['Problem Solving', 'Solve tough problems with insightful, practical solutions, making wise deicisions despite ambiguity and thinks strategically'],
    ['Curiosity', 'Demonstrates an active, open mind by uncovering and exploring big ideas that accelerate genuine progress for Funding Circle'],
    ['Accountability', 'Promotes a culture of openness, accountability and trust. Generates a progressive attitude through team norms and behaviours.'],
    ['Communication', 'Listens well and is concise and articulate. I treat people with respect and consideration'],
    ['Delivery', 'Shows a bias to actions, delivering excellent results over just following a process'],
    ['Grit', 'Steadfast in the pursuit of the goals of the organistaion, their teams, their colleagues and themselves.'],
    ['People Orientation', 'Provides support to colleagues, expresses gratitude, spreads knowledge and develops people outside formal reporting or team structures'],
    ['Emotional Intelligence', 'Takes time to understand what motivates other, shows empathy and deepens gneuine relationships with others'],
    ['Craft', 'Inspires others by passionately promoting practices to create excellent quality products and services'],
    ['Purpose', 'shows conviction over time, developing a sense of purpose for what they do']
  ]
  const form = FormApp.create(title).setProgressBar(true)
  form.setTitle(title)
  form.addSectionHeaderItem().setTitle('First a little bit about you')
  form.addTextItem().setTitle('What\'s your first name?')
  form.addTextItem().setTitle('What\'s your surname name?')
  form.addPageBreakItem().setTitle('The What')
  theWhatQuestions.forEach(([k, v]) => createMultipleChoiceGrid(form, k, v))
  form.addPageBreakItem().setTitle('The How (Our Values)')
  theHowQuestions.forEach(([k, v]) => createMultipleChoiceGrid(form, k, v))
  form.addPageBreakItem().setTitle('General Feedback')
  form.addTextItem().setTitle(`Generally, what things should ${youThey} keep doing`)
  form.addTextItem().setTitle(`What things could ${youThey} focus on improving`)
  return form
}

