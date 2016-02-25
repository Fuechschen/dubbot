module.exports = function (sequelize, Sequelize) {
    return sequelize.define('event', {
        id: {type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull:false},
        name: {type: Sequelize.STRING, allowNull: false},
        description: {type: Sequelize.STRING, allowNull: true},
        theme_msg: {type: Sequelize.STRING, allowNull: true},
        from: {type: Sequelize.DATE, allowNull: true},
        to: {type: Sequelize.DATE, allowNull: true},
        lock_queue: {type: Sequelize.BOOLEAN, defaultValue: false},
        active: {type: Sequelize.BOOLEAN, defaultValue: true}
    }, {
        underscored: true,
        tableName: 'events'
    });
};
