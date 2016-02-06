module.exports = function (sequelize, Sequelize) {
    return sequelize.define('queuebans', {
        id: {type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull:false},
        dub_user_id: {type: Sequelize.STRING, allowNull: false},
        dub_mod_id: {type: Sequelize.STRING, allowNull: false},
        active: {type: Sequelize.BOOLEAN, defaultValue: false},
        reason: {type: Sequelize.STRING, defaultValue: 0},
        permanent: {type: Sequelize.BOOLEAN, defaultValue: false},
        expires: {type: Sequelize.DATE, allowNull: false}
    }, {
        underscored: true,
        tableName: 'queuebans'
    });
};
