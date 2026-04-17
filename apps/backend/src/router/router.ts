import { Router } from "express";
import workFlowRouter from "./workflow";


const router:Router=Router()



router.use("/workflow", workFlowRouter);



export default router;  