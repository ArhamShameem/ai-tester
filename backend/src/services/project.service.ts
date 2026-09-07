import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

interface CreateProjectInput {
  name: string;
  url: string;
}

interface UpdateProjectInput {
  name?: string;
  url?: string;
}

export const createProject = async (
  userId: string,
  { name, url }: CreateProjectInput
) => {
  const project = await prisma.project.create({
    data: {
      name,
      url,
      userId
    },
    include: {
      _count: {
        select: {
          testCases: true,
          testRuns: true
        }
      }
    }
  });

  return project;
};

export const getProjects = async (userId: string) => {
  const projects = await prisma.project.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      _count: {
        select: {
          testCases: true,
          testRuns: true
        }
      },
      testRuns: {
        take: 1,
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          status: true,
          createdAt: true
        }
      }
    }
  });

  return projects;
};

export const getProjectById = async (userId: string, projectId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId
    },
    include: {
      _count: {
        select: {
          testCases: true,
          testRuns: true
        }
      },
      testRuns: {
        take: 5,
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          status: true,
          startedAt: true,
          completedAt: true,
          createdAt: true
        }
      }
    }
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project;
};

export const updateProject = async (
  userId: string,
  projectId: string,
  { name, url }: UpdateProjectInput
) => {
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId
    }
  });

  if (!existingProject) {
    throw new AppError("Project not found", 404);
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: projectId
    },
    data: {
      ...(name !== undefined && { name }),
      ...(url !== undefined && { url })
    },
    include: {
      _count: {
        select: {
          testCases: true,
          testRuns: true
        }
      },
      testRuns: {
        take: 1,
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          status: true,
          createdAt: true
        }
      }
    }
  });

  return updatedProject;
};

export const deleteProject = async (userId: string, projectId: string) => {
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId
    }
  });

  if (!existingProject) {
    throw new AppError("Project not found", 404);
  }

  await prisma.project.delete({
    where: {
      id: projectId
    }
  });

  return true;
};
