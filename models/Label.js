module.exports = function (sequelize, Sequelize) {
    return sequelize.define('labels', {
        id: {type: Sequelize.INTEGER.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true},
        name: {type: Sequelize.STRING, allowNull: false}
    }, {
        underscored: true,
        tableName: 'labels'
    });
};
