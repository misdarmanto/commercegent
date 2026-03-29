interface RequestCheckerType {
  requireList: string[]
  requestData: object
}

export const requestChecker = ({
  requireList,
  requestData
}: RequestCheckerType): string => {
  const data = requestData as Record<string, unknown>
  const emptyField: string[] = []
  requireList.forEach((value: string) => {
    if (data[value] === undefined) {
      emptyField.push(value)
    }
  })
  return emptyField.toString()
}
