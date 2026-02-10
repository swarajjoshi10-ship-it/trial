
// Simulate the blockchain state in user's browser for demo purposes
const TASKS_KEY = 'satya_demo_tasks';
const ID_KEY = 'satya_demo_id';

const getStore = () => {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    const nextId = parseInt(localStorage.getItem(ID_KEY) || "0");
    return { tasks, nextId };
};

const saveStore = (tasks, nextId) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    localStorage.setItem(ID_KEY, nextId.toString());
};

export class MockSmartContract {
    constructor(account) {
        this.account = account;
    }

    get methods() {
        return {
            // Read Functions
            nextTaskId: () => ({
                call: async () => {
                    const { nextId } = getStore();
                    return nextId;
                }
            }),
            tasks: (id) => ({
                call: async () => {
                    const { tasks } = getStore();
                    const t = tasks.find(t => t.id == id);
                    if (!t) throw new Error("Task not found");
                    return t;
                }
            }),

            // Write Functions (Transactions)
            createTask: (desc, targetWei, vendor) => ({
                send: async ({ from, value }) => {
                    console.log("📝 MOCK: Creating Task", { desc, targetWei, vendor });

                    // Simulate Latency
                    await new Promise(r => setTimeout(r, 1000));

                    // 1. Trigger Fake Payment (Optional - to make Metamask pop up)
                    // We can skip this or send 0 ETH to self to trigger popup if desired.
                    // For smoothest demo, we just simulate the state change.

                    const { tasks, nextId } = getStore();
                    const newTask = {
                        id: nextId,
                        description: desc,
                        targetAmount: targetWei, // Stored as string used by Web3
                        fundedAmount: "0",
                        vendor: vendor,
                        creator: from,
                        deadline: (Date.now() + 86400000 * 30),
                        proofImageHash: "",
                        isInitialReleased: false,
                        isCompleted: false,
                        isVerified: false
                    };

                    tasks.push(newTask);
                    saveStore(tasks, nextId + 1);
                    return true;
                }
            }),

            fundTask: (id) => ({
                send: async ({ from, value }) => {
                    console.log(`💰 MOCK: Funding Task #${id} with ${value} Wei`);
                    await new Promise(r => setTimeout(r, 1000));

                    const { tasks, nextId } = getStore();
                    const task = tasks.find(t => t.id == id);
                    if (!task) throw new Error("Task not found");

                    // Logic
                    let current = BigInt(task.fundedAmount);
                    let target = BigInt(task.targetAmount);
                    let contribution = BigInt(value);

                    if (current + contribution > target) {
                        contribution = target - current;
                    }

                    task.fundedAmount = (current + contribution).toString();
                    saveStore(tasks, nextId);
                    return true;
                }
            }),

            claimInitialFunds: (id) => ({
                send: async ({ from }) => {
                    console.log(`🔓 MOCK: Claiming Initial for #${id}`);
                    await new Promise(r => setTimeout(r, 1000));

                    const { tasks, nextId } = getStore();
                    const task = tasks.find(t => t.id == id);

                    if (!task.fundedAmount >= task.targetAmount) throw new Error("Not funded");
                    if (task.isInitialReleased) throw new Error("Already claimed");

                    task.isInitialReleased = true;
                    saveStore(tasks, nextId);
                    return true;
                }
            }),

            submitProof: (id, hash) => ({
                send: async ({ from }) => {
                    console.log(`📷 MOCK: Submitting Proof for #${id}`);
                    await new Promise(r => setTimeout(r, 1000));

                    const { tasks, nextId } = getStore();
                    const task = tasks.find(t => t.id == id);
                    task.proofImageHash = hash;
                    saveStore(tasks, nextId);

                    // AUTO-VERIFY SIMULATION (Since no backend)
                    // In 5 seconds, the "AI" will verify it.
                    setTimeout(() => {
                        console.log("🤖 MOCK AI: Verifying...");
                        const { tasks: t2, nextId: n2 } = getStore();
                        const tUpdate = t2.find(t => t.id == id);
                        if (tUpdate) {
                            tUpdate.isVerified = true;
                            tUpdate.isCompleted = true;
                            saveStore(t2, n2);
                            console.log("✅ MOCK AI: Verified!");
                        }
                    }, 5000);

                    return true;
                }
            })
        };
    }
}
