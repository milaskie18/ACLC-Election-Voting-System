const Candidate = require('../models/Candidate');
const User = require('../models/User');

const applyIndependent = async (req, res) => {
    try {
        console.log("1. Application Received:", req.body);
        const { fullName, studentId, level, position, applicationType } = req.body;

        if (!fullName || !studentId || !level || !position) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log("2. Checking Masterlist for ID:", studentId);
        const userExists = await User.findOne({ studentId });
        console.log("3. User Found:", userExists);
        
        if (!userExists) {
            return res.status(404).json({ message: 'Diagnostic: Student ID not found in Masterlist.' });
        }

        console.log("4. Attempting to create Candidate with status 'Pending'...");
        const newCandidate = await Candidate.create({
            name: fullName, 
            position,
            partylist: applicationType === 'Independent' ? 'Independent' : 'Pending',
            level,
            votes: 0,
            status: 'Pending'
        });

        console.log("5. Candidate Successfully Created:", newCandidate);
        res.status(201).json({ message: 'Application submitted', candidate: newCandidate });
    } catch (error) {
        console.error("CRITICAL APPLY ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

const applyPartylist = async (req, res) => {
    try {
        console.log("1. Application Received:", req.body);
        const { partylistName, fullName, studentId, level, position, taggedMembers } = req.body;

        console.log("2. Checking Masterlist for ID:", studentId);
        const founder = await User.findOne({ studentId });
        console.log("3. User Found:", founder);
        
        if (!founder) return res.status(404).json({ message: 'Diagnostic: Student ID not found in Masterlist.' });

        console.log("4. Attempting to create Candidate with status 'Pending'...");
        const newCandidate = await Candidate.create({
            name: fullName,
            position,
            partylist: partylistName,
            level,
            votes: 0,
            status: 'Pending'
        });
        console.log("5. Candidate Successfully Created:", newCandidate);

        if (taggedMembers && taggedMembers.length > 0) {
            for (const tag of taggedMembers) {
                const taggedUser = await User.findOne({ studentId: tag.studentId });
                if (taggedUser) {
                    console.log(`Need to invite ${tag.studentId} as ${tag.position} for ${partylistName}`);
                }
            }
        }

        res.status(201).json({ message: 'Partylist created and invites sent.' });
    } catch (error) {
        console.error("CRITICAL APPLY ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

const acceptInvite = async (req, res) => res.status(200).json({ message: "Accepted" });
const declineInvite = async (req, res) => res.status(200).json({ message: "Declined" });

module.exports = {
    applyIndependent,
    applyPartylist,
    acceptInvite,
    declineInvite
};