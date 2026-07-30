const UserAuditLog = require('../models/UserAuditLogModels');
const User = require('../models/UserModels');

const createUserAuditLog = async ({
    actorUserId,
    targetUserId,
    action,
    oldValue = null,
    newValue = null,
    description = null
}) => {
    return UserAuditLog.create({
        actor_user_id: actorUserId || null,
        target_user_id: targetUserId || null,
        action,
        old_value: oldValue,
        new_value: newValue,
        description
    });
};

const getUserAuditLogs = async ({ page = 1, limit = 50, action, targetUserId } = {}) => {
    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const offset = (currentPage - 1) * currentLimit;

    const where = {};

    if (action && action !== 'all') {
        where.action = action;
    }

    if (targetUserId) {
        where.target_user_id = targetUserId;
    }

    const { rows, count } = await UserAuditLog.findAndCountAll({
        where,
        include: [
            {
                model: User,
                as: 'actor',
                attributes: ['id', 'nama', 'email', 'role', 'jabatan']
            },
            {
                model: User,
                as: 'target',
                attributes: ['id', 'nama', 'email', 'role', 'jabatan']
            }
        ],
        order: [['created_at', 'DESC']],
        limit: currentLimit,
        offset
    });

    return {
        logs: rows,
        pagination: {
            page: currentPage,
            limit: currentLimit,
            total: count,
            totalPages: Math.ceil(count / currentLimit)
        }
    };
};

module.exports = {
    createUserAuditLog,
    getUserAuditLogs
};
