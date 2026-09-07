import { Request, Response, NextFunction } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from "../services/project.service";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await createProject(req.user!.id, req.body);
    return res.status(201).json({
      project
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projects = await getProjects(req.user!.id);
    return res.json({
      projects
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await getProjectById(req.user!.id, id);
    return res.json({
      project
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await updateProject(
      req.user!.id,
      id,
      req.body
    );
    return res.json({
      project
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await deleteProject(req.user!.id, id);
    return res.json({
      message: "Project deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
