module.exports = function (sequelize, Sequelize) {
    return sequelize.define('CustomText', {
        trigger: {type: Sequelize.STRING, allowNull: false},
        response: {type: Sequelize.STRING, allowNull: false}
    }, {
        underscored: true,
        tableName: 'custom_texts'
    });
}
