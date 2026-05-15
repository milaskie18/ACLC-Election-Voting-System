    // @desc    Get all active candidates (Tally)
// @route   GET /api/admin/candidates
const loadTally = async (req, res) => {
    try {
        // Only fetch candidates that are NOT archived
        const candidates = await Candidate.find({ isArchived: false }).sort({ position: 1 });
        res.status(200).json(candidates);
    } catch (error) {
        console.error("Error loading tally:", error);
        res.status(500).json({ message: 'Server error while loading candidates.' });
    }
};

// @desc    Edit/Update a candidate
// @route   PUT /api/admin/candidates/:id
const editCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, position, partylist, level } = req.body;

        const updatedCandidate = await Candidate.findByIdAndUpdate(
            id,
            { name, position, partylist, level },
            { new: true, runValidators: true }
        );

        if (!updatedCandidate) {
            return res.status(404).json({ message: 'Candidate not found.' });
        }

        res.status(200).json({ message: 'Candidate updated!', candidate: updatedCandidate });
    } catch (error) {
        console.error("Error updating candidate:", error);
        res.status(500).json({ message: 'Server error while updating candidate.' });
    }
};

// @desc    Soft Delete a candidate (Archive)
// @route   DELETE /api/admin/candidates/:id
const deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Instead of permanently deleting, we set isArchived to true
        const archivedCandidate = await Candidate.findByIdAndUpdate(
            id,
            { isArchived: true },
            { new: true }
        );

        if (!archivedCandidate) {
            return res.status(404).json({ message: 'Candidate not found.' });
        }

        res.status(200).json({ message: 'Candidate archived successfully.' });
    } catch (error) {
        console.error("Error archiving candidate:", error);
        res.status(500).json({ message: 'Server error while deleting candidate.' });
    }
};

// Don't forget to export the new functions at the bottom!
module.exports = {
    addCandidate,
    loadTally,
    editCandidate,
    deleteCandidate
};