import { InternalServerError } from "../lib/error";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/winston";
import { workFlowCreateInputType } from "../schema/workflow";




const createWorkflowService=async (workflow:workFlowCreateInputType["body"])=>{
    try{
        const workflowCreated=   await prisma.workFlow.create({data:workflow})
        return workflowCreated

    }catch(error){
        logger.error(`Error in createWorkflowService: ${error}`)
        throw error
    }
}


export { createWorkflowService };
