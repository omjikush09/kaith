export type FlowNodeData = {
	kind?: string;
	appType?: string;
	label?: string;
	description?: string;
	config?: Record<string, unknown>;
};

export type FlowNode = {
	id: string;
	type?: string;
	data?: FlowNodeData;
	position?: { x: number; y: number };
};

export type FlowEdge = {
	id: string;
	source: string;
	target: string;
	sourceHandle?: string;
	targetHandle?: string;
};

export type WorkflowSnapshot = {
	nodes?: FlowNode[];
	edges?: FlowEdge[];
	trigger?: unknown;
	triggerNodeId?: string | null;
};
