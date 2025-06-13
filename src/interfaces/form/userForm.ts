import { Gender } from "@domain/models/account/user";

// Create 用接口
export interface CreateUserForm {
  name: string
  email: string
  birthdate: string  // 接口里仍然用字符串接收，路由里再转换
  gender: Gender
  height: number
  status: boolean
}

// Update 用接口
export interface UpdateUserForm {
  name?: string
  email?: string
  birthdate?: string
  gender?: Gender
  height?: number
  status?: boolean
}

