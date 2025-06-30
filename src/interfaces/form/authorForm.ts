export interface CreateAuthorForm {
  name: string
  country?: string
  birthDate?: string    // ISO 日期字符串
  deathDate?: string    // ISO 日期字符串
  introduction?: string
}

export interface UpdateAuthorForm {
  name?: string
  country?: string
  birthDate?: string
  deathDate?: string
  introduction?: string
}
