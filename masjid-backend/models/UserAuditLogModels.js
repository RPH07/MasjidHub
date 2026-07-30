const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./UserModels');

const UserAuditLog = sequelize.define('UserAuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    actor_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    target_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    action: {
        type: DataTypes.ENUM('update_access', 'update_status', 'reset_password', 'delete_user', 'delete_me_request'),
        allowNull: false
    },
    old_value: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        get() {
            const value = this.getDataValue('old_value');
            if (!value) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        },
        set(value) {
            this.setDataValue('old_value', value ? JSON.stringify(value) : null);
        }
    },
    new_value: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        get() {
            const value = this.getDataValue('new_value');
            if (!value) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        },
        set(value) {
            this.setDataValue('new_value', value ? JSON.stringify(value) : null);
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'user_audit_logs',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

UserAuditLog.belongsTo(User, {
    foreignKey: 'actor_user_id',
    as: 'actor'
});

UserAuditLog.belongsTo(User, {
    foreignKey: 'target_user_id',
    as: 'target'
});

module.exports = UserAuditLog;
