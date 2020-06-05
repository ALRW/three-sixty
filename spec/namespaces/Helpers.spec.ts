import { mock } from 'jest-mock-extended'
import { Helpers } from '../../namespaces/Helpers'

describe('Helpers', () => {

  describe('matrixToViewModel', () => {
    it('manipulates data from a sheet into the desired shape for the ui', () => {
      const mockSheet = mock<GoogleAppsScript.Spreadsheet.Sheet>()
      const mockRange = mock<GoogleAppsScript.Spreadsheet.Range>()
      mockSheet.getName.mockReturnValue('Team-Name')
      mockSheet.getDataRange.mockReturnValue(mockRange)
      mockRange.getValues.mockReturnValue([
        ['firstname', 'lastname', 'email', 'tsid', 'psid', 'tfid', 'pfid', 'role']
      ])
      const result = {
        teamName: 'Team-Name',
        members: [{
          firstName: 'firstname',
          lastName: 'lastname',
          role: 'role',
          email: 'email'
        }]
      }
      expect(Helpers.matrixToViewModel(mockSheet)).toMatchObject(result)
    })
  })
})
