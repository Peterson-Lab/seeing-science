import { gql, request } from 'graphql-request'
import { setupTestServer, teardownTestServer, TestState } from './helpers'

let testState: TestState | null = null

beforeAll(async () => {
  testState = await setupTestServer()
})

afterAll(async () => {
  if (testState === null) throw new Error('test state cannot be null')
  await teardownTestServer(testState)
})

const registerGql = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        username
        role
      }
      errors {
        field
        message
      }
    }
  }
`

test('Register user - valid input', async () => {
  const res = await request(
    `http://localhost:${testState?.port}/graphql`,
    registerGql,
    {
      input: {
        email: 'mw123@gmail.com',
        username: 'zir123',
        password: 'hunter2',
      },
    }
  )

  expect(res.register.user.id).toBeTruthy()
  expect(res.register.errors).toBeFalsy()
})

type InvalidInput = [
  { email: string; username: string; password: string },
  { field: string; message: string }
]

const invalidInputTable: InvalidInput[] = [
  [
    { email: 'mw123.com', username: 'zireael', password: 'hunter2' },
    { field: 'email', message: 'Invalid Email' },
  ],
  [
    { email: 'mattwilki@123.com', username: 'zi', password: 'hunter2' },
    { field: 'username', message: 'Username must be longer than 2 characters' },
  ],
  [
    { email: 'mattwilki@123.com', username: 'zireael', password: 'hun' },
    { field: 'password', message: 'Password must be longer than 4 characters' },
  ],
]
describe('Register user - invalid inputs', () => {
  test.each(invalidInputTable)(`Register(%s)`, async (input, expected) => {
    const res = await request(
      `http://localhost:${testState?.port}/graphql`,
      registerGql,
      { input }
    )

    expect(res.register.errors[0].field).toBe(expected.field)

    expect(res.register.errors[0].message).toBe(expected.message)
  })
})
