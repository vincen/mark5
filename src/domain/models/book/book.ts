export interface Book {
  pkid: number;
  title: string;
  isbn: string;
  price: number;
  // 版次
  edition: string;
  // 印次
  printing: string;
  imageUrl: string;
  remark?: string;

  // 关系：多对多
  authorIds: number[]; // 作者ID列表
  translatorIds?: number[]; // 可选属性，表示书籍可能有多个译者ID列表
  // 关系：多对一
  publisherId: number; // 一定有出版社
}

export interface Author {
  pkid: number;
  name: string;

  // 以下字段作者可选，但译者可能缺失这些信息
  country?: string;
  birthDate?: Date;
  deathDate?: Date; // 可选属性，表示作者可能还在世
  introduction?: string;  // 个人简介
}

export interface Publisher {
  pkid: number;
  name: string;
}