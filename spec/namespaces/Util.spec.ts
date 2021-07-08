import { mock } from 'jest-mock-extended'
import { Util } from '../../namespaces/Util'
import { Constants } from '../../namespaces/Constants'

describe('Helpers', () => {
  const mockSheet = mock<GoogleAppsScript.Spreadsheet.Sheet>()
  const mockRange = mock<GoogleAppsScript.Spreadsheet.Range>()
  mockSheet.getName.mockReturnValue('Team-Name')
  mockSheet.getDataRange.mockReturnValue(mockRange)
  mockRange.getValues.mockReturnValue([
    ['firstname', 'lastname', 'email', 'tsid', 'psid', 'tfid', 'pfid', 'role'],
    ['firstname1', 'lastname1', 'email1', 'tsid1', 'psid1', 'tfid1', 'pfid1', 'role1']
  ])

  describe('matrixToViewModel', () => {
    it('manipulates data from a sheet into the desired shape for the ui', () => {
      const result = {
        teamName: 'Team-Name',
        members: [{
          firstName: 'firstname',
          lastName: 'lastname',
          role: 'role',
          email: 'email'
        },{
          firstName: 'firstname1',
          lastName: 'lastname1',
          role: 'role1',
          email: 'email1'
        }]
      }
      expect(Util.matrixToViewModel(mockSheet)).toMatchObject(result)
    })
  })

  describe('getPersonsIndex', () => {
    it('returns the index for the row containing an individuals data', () => {
      expect(Util.getPersonsIndex(mockSheet, 'firstname1', 'lastname1')).toBe(2)
    })
  })

  describe('multiplyArray', () => {
    it('multiplys an array a given number of times', () => {
      expect(Util.multiplyArray([1,2,3], 3)).toEqual([
        1,2,3,
        1,2,3,
        1,2,3,
      ])
    })
  })

  describe('isNotDefaultSheet', () => {
    it('is used to remove the default sheet from the data matrix', () => {
      const mockDefaultSheet = mock<GoogleAppsScript.Spreadsheet.Sheet>()
      mockDefaultSheet.getName.mockReturnValue(Constants.DEFAULT_SHEET)
      expect([
        mockDefaultSheet,
        mockSheet
      ].filter(Util.isNotDefaultSheet)[0].getName()).toEqual('Team-Name')
    })
  })
})
