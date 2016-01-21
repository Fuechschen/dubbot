module.exports = function (sequelize, Sequelize) {
    return sequelize.define('customtext', {
        trigger: {type: Sequelize.STRING, allowNull: false},
        response: {type: Sequelize.TEXT, allowNull: false}
    }, {
        underscored: true,
        tableName: 'custom_texts'
    });
};
