// Change password for a logged-in user. Requires the current password
// to be correct before allowing the change.
router.patch('/:id/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "MISSING_FIELDS" });
        }
        if (newPassword.length < 4) {
            return res.status(400).json({ error: "PASSWORD_TOO_SHORT" });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "USER_NOT_FOUND" });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: "INCORRECT_CURRENT_PASSWORD" });
        }

        user.password = newPassword; // hashed automatically by the pre('save') hook
        await user.save();

        res.json({ status: "PASSWORD_UPDATED" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});