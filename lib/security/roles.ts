import { Request, Response, NextFunction } from 'express'

export enum Roles {
  Admin = 'admin',
  User =