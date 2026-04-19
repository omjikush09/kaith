import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/winston";
import {
	workFlowCreateInputType,
	workFlowUpdateInputType,
} from "../schema/workflow";

const createWorkflowService = async (
	workflow: workFlowCreateInputType["body"],
) => {
	try {
		return await prisma.workFlow.create({ data: workflow });
	} catch (error) {
		logger.error(`Error in createWorkflowService: ${error}`);
		throw error;
	}
};

const listWorkflowsService = async (filters: {
	userId?: string;
	search?: string;
	page: number;
	limit: number;
}) => {
	try {
		const where: Prisma.WorkFlowWhereInput = {};
		if (filters.userId) where.userId = filters.userId;
		if (filters.search)
			where.name = { contains: filters.search, mode: "insensitive" };

		const skip = (filters.page - 1) * filters.limit;
		const [items, total] = await prisma.$transaction([
			prisma.workFlow.findMany({
				where,
				orderBy: { updatedAt: "desc" },
				skip,
				take: filters.limit,
			}),
			prisma.workFlow.count({ where }),
		]);

		return {
			items,
			total,
			page: filters.page,
			limit: filters.limit,
			totalPages: Math.max(1, Math.ceil(total / filters.limit)),
		};
	} catch (error) {
		logger.error(`Error in listWorkflowsService: ${error}`);
		throw error;
	}
};

const getWorkflowByIdService = async (id: string) => {
	try {
		return await prisma.workFlow.findUnique({ where: { id } });
	} catch (error) {
		logger.error(`Error in getWorkflowByIdService: ${error}`);
		throw error;
	}
};

const updateWorkflowService = async (
	id: string,
	patch: workFlowUpdateInputType["body"],
) => {
	try {
		return await prisma.workFlow.update({
			where: { id },
			data: patch,
		});
	} catch (error) {
		logger.error(`Error in updateWorkflowService: ${error}`);
		throw error;
	}
};

const deleteWorkflowService = async (id: string) => {
	try {
		return await prisma.workFlow.delete({ where: { id } });
	} catch (error) {
		logger.error(`Error in deleteWorkflowService: ${error}`);
		throw error;
	}
};

export {
	createWorkflowService,
	listWorkflowsService,
	getWorkflowByIdService,
	updateWorkflowService,
	deleteWorkflowService,
};
