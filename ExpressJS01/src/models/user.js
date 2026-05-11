const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/database");

// MongoDB
// const mongoose = require('mongoose');
//
// const userSchema = new mongoose.Schema({
//     name: String,
//     email: String,
//     password: String,
//     role: String,
// });
//
// const User = mongoose.model('user', userSchema);
// module.exports = User;

let UserEntity;

const getUserEntity = () => {
    if (UserEntity) {
        return UserEntity;
    }

    const sequelize = getSequelize();
    UserEntity = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            role: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: "User"
            }
        },
        {
            tableName: "users",
            timestamps: true,
            underscored: true
        }
    );

    return UserEntity;
};

const findByEmail = async (email) => {
    const User = getUserEntity();
    return User.findOne({ where: { email }, raw: true });
};

const createUser = async ({ name, email, password, role = "User" }) => {
    const User = getUserEntity();
    const created = await User.create({ name, email, password, role });
    return {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role
    };
};

const getAllUsersWithoutPassword = async () => {
    const User = getUserEntity();
    return User.findAll({
        attributes: ["id", "name", "email", "role", "created_at", "updated_at"],
        order: [["id", "DESC"]],
        raw: true
    });
};

const updatePasswordByEmail = async (email, newPassword) => {
    const User = getUserEntity();
    const [affectedRows] = await User.update({ password: newPassword }, { where: { email } });
    return affectedRows > 0;
};

module.exports = {
    getUserEntity,
    findByEmail,
    createUser,
    getAllUsersWithoutPassword,
    updatePasswordByEmail
};
