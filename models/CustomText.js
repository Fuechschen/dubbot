module.exports = function (sequelize, Sequelize) {
    return sequelize.define('customtext', {
        trigger: {type: Sequelize.STRING, allowNull: false, unique: true},
        response: {type: Sequelize.TEXT, allowNull: false},
        active: {type: Sequelize.BOOLEAN, defaultValue: true}
    }, {
        underscored: true,
        tableName: 'custom_texts'
    });
};
