export class AlreadyExistsError extends Error {
  constructor(objectName: string, entityName: string) {
    super(`"${objectName}" with name "${entityName}" already exists`)
    this.name = 'AlreadyExistsError'
  }
}

export class NotFoundError extends Error {
  constructor(objectName: string, entity: number | string) {
    super(`"${objectName}" with name "${entity}" not found`)
    this.name = 'NotFoundError'
  }
}

export class RelatedEntityError extends Error {
  constructor(objectName: string, entity: number | string, count: number) {
    super(`Cannot delete "${objectName}" with "${entity}" because it has "${count}" related entities.`)
    this.name = 'RelatedEntityError'
  }
}
