module.exports = function (sequelize, Sequelize) {
    return sequelize.define('Track', {
        id: {type: Sequelize.INTEGER.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true},
        name: {type: Sequelize.STRING, allowNull: false},
        fkid: {type: Sequelize.STRING, allowNull: false},
        thumbnail: {type: Sequelize.STRING, allowNull: true},
        type: {type: Sequelize.STRING, allowNull: true},
        songLength: {type: Sequelize.INTEGER, allowNull: true},
        blacklisted: {type: Sequelize.BOOLEAN, defaultValue: 0},
        label: {type: Sequelize.STRING, allowNull: true}
    }, {
        underscored: true,
        tableName: 'tracks'
    });
}
