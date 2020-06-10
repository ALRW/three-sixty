import { Constants } from './Constants'
import { Util } from './Util'

export namespace Results {

  const sheetData = (sheet: GoogleAppsScript.Spreadsheet.Sheet): string[][] =>
  sheet
    .getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn())
    .getValues()

  const coreValues = (data: string[][]): string[][] =>
    data.map(datum =>
      datum.slice(3, -2))

  const chartRange = [0, Math.max(...Object.keys(Constants.VALUE_MAPPING)
                              .map(e => Constants.VALUE_MAPPING[e]))]

  const valueToNumeric = (data: string[][]): number[][]=>
    data.map(datum => datum.map(item => Constants.VALUE_MAPPING[item]))

  const dataToChartValues = (data: number[], headers: string[]) =>
  data.map((n, i) =>
    ({value: headers[i], result: n}))

  const sustains = (data: string[][]): string[] =>
  data.reduce((res, datum) =>
    [...res, ...datum.slice(-2, -1)], [])

  const improvements = (data: string[][]): string[] =>
  data.reduce((res, datum) =>
    [...res, ...datum.slice(-1)], [])

  const numericMatrixToAverage = (data: number[][]) => {
    const sum = data.slice(1).reduce((res, datum) =>
      datum.map((n, i) =>
        n + res[i]
      ), data[0]
    )
    return sum.map(n => n / data.length)
  }

  const formatData = (
    groupedPersonalData: string[][][],
    groupedTeamData: string[][][],
    headers: string[],
    name: string
  ) => {
    const zippedData = groupedPersonalData.map((e, i) => [e, groupedTeamData[i]])
    const payload: object[] = zippedData.map(([personalResults, teamResults]) => {
      const personCore = coreValues(personalResults)
      const personNumeric = valueToNumeric(personCore)
      const personChartValues = dataToChartValues(personNumeric[0], headers)
      const personSustains = sustains(personalResults)
      const personImprovements = improvements(personalResults)
      const teamCore = coreValues(teamResults)
      const teamNumeric = valueToNumeric(teamCore)
      const teamAverage = numericMatrixToAverage(teamNumeric)
      const teamChartValues = dataToChartValues(teamAverage, headers)
      const teamSustains = sustains(teamResults)
      const teamImprovements = improvements(teamResults)
      return {
        individual: {
          values: personChartValues
        },
        team: {
          values: teamChartValues
        },
        name: name,
        range: chartRange,
        sustain: [...personSustains, ...teamSustains],
        improve: [...personImprovements, ...teamImprovements]
      }
    })
      return payload
  }

  const getHeaders = (sheets: any[]): string[] => {
    const { 0: firstSheet } = sheets
    const { 0: sheetHeaders } = firstSheet.getRange(1, 1, 1, firstSheet.getMaxColumns()).getValues()
    const cleanHeaders = sheetHeaders.filter(Boolean)
      .slice(3, -2)
      .map((header: string) => header.substring(0, header.indexOf('[')))
    return cleanHeaders
  }

  export function createPayload(
    personalSpreadsheetId: string,
    teamSpreadsheetId: string,
    name: string
  ) {
    const personalSpreadsheet = SpreadsheetApp.openById(personalSpreadsheetId)
    const teamSpreadsheet = SpreadsheetApp.openById(teamSpreadsheetId)
    const personalSheets = personalSpreadsheet.getSheets().filter(Util.isNotDefaultSheet)
    const teamSheets = teamSpreadsheet.getSheets().filter(Util.isNotDefaultSheet)
    const headers = getHeaders(personalSheets)
    const getRowsPerRound = sheet => sheet.getLastRow() - 1
    const rowsPerRoundPersonal = personalSheets.map(getRowsPerRound).reverse()
    const rowsPerRoundTeam = teamSheets.map(getRowsPerRound).reverse()
    const personalData = sheetData(personalSpreadsheet.getSheetByName(Constants.DEFAULT_RESULTS_SHEET))
    const teamData = sheetData(teamSpreadsheet.getSheetByName(Constants.DEFAULT_RESULTS_SHEET))
    const groupRounds = data => (result, n, i, original) => {
      if(i === original.length -1) {
        return result
      }
      return [...result, data.slice(n, original[i + 1])]
    }
    const groupedPersonalData = [0, ...rowsPerRoundPersonal].reduce(groupRounds(personalData), [])
    const groupedTeamData = [0, ...rowsPerRoundTeam].reduce(groupRounds(teamData), [])
    return formatData(groupedPersonalData, groupedTeamData, headers, name)
  }
}
