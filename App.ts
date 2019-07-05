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

