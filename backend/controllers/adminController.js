const Candidate = require('../models/Candidate');

// 1. Fetch Approved candidates OR legacy candidates (no status) for the main tally
const getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find({ 
            $or: [
                { status: 'Approved' },
                { status: { $exists: false } } // Catches your older test data!
            ],
            isArchived: false 
        });
        res.status(200).json(candidates);
    } catch (error) {
        console.error("Tally Fetch Error:", error);
        res.status(500).json({ message: 'Failed to fetch tally' });
    }
};

// 2. Fetch only Pending candidates for the Approvals tab
const getPendingCandidates = async (req, res) => {
    try {
        const pending = await Candidate.find({ 
            status: 'Pending', 
            isArchived: false 
        });
        res.status(200).json(pending);
    } catch (error) {
        console.error("Pending Fetch Error:", error);
        res.status(500).json({ message: 'Failed to fetch pending candidates' });
    }
};

// 3. Approve Candidate
const approveCandidate = async (req, res) => {
    try {
        await Candidate.findByIdAndUpdate(req.params.id, { status: 'Approved' });
        res.status(200).json({ message: 'Candidate approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve candidate' });
    }
};

// 4. Reject Candidate
const rejectCandidate = async (req, res) => {
    try {
        await Candidate.findByIdAndUpdate(req.params.id, { status: 'Rejected' });
        res.status(200).json({ message: 'Candidate rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject candidate' });
    }
};

// --- RESTORED MISSING FUNCTIONS ---

// 5. Add Candidate (Admin bypasses the pending status)
const addCandidate = async (req, res) => {
    try {
        const { name, position, partylist, level } = req.body;
        const newCandidate = await Candidate.create({
            name,
            position,
            partylist,
            level,
            votes: 0,
            status: 'Approved' // Skips the approval queue!
        });
        res.status(201).json(newCandidate);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add candidate' });
    }
};

// 6. Edit Candidate
const editCandidate = async (req, res) => {
    try {
        const updated = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to edit candidate' });
    }
};

// 7. Delete Candidate
const deleteCandidate = async (req, res) => {
    try {
        await Candidate.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Candidate deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete candidate' });
    }
};

module.exports = {
    getCandidates,
    getPendingCandidates,
    approveCandidate,
    rejectCandidate,
    addCandidate,
    editCandidate,
    deleteCandidate
};