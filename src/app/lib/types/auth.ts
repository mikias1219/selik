export interface AdminLogin {
  username: string;
  password: string;
}

export interface AdminCreate extends AdminLogin {
  user_type: number; // 1 or 2
}

export interface EndUserLogin {
  username: string;
  password: string;
}

export interface EndUserCreate {
  username: string;
  password: string;
  // Add other fields if needed
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  user_type: number;
  // ...
}

export interface EndUserOut {
  id: number;
  username: string;
  // ...
}
