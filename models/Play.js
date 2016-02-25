module.exports = function (sequelize, Sequelize) {
    return sequelize.define('play', {
        id: {type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull:false},
        play_id: {type: Sequelize.STRING, allowNull: false},
        song_id: {type: Sequelize.STRING, allowNull: false},
        user_id: {type: Sequelize.STRING, allowNull: false},
        upvotes: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        downvotes: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        grabs: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        listeners: {type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0},
        time: {type: Sequelize.DATE, allowNull: true},
        skipped: {type: Sequelize.BOOLEAN, defaultValue: false}
    }, {
        underscored: true,
        tableName: 'plays_test'
    });
};
