module.exports = function (sequelize, Sequelize) {
    return sequelize.define('tracks', {
        id: {type: Sequelize.INTEGER.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true, unique: true},
        dub_id: {type: Sequelize.STRING, allowNull: false},
        name: {type: Sequelize.STRING, allowNull: false},
        source_id: {type: Sequelize.STRING, allowNull: false},
        thumbnail: {type: Sequelize.STRING, allowNull: true},
        type: {type: Sequelize.STRING, allowNull: true},
        songLength: {type: Sequelize.INTEGER, allowNull: true},
        blacklisted: {type: Sequelize.BOOLEAN, defaultValue: 0},
        bl_reason: {type: Sequelize.STRING, allowNull: true},
        last_played: {type: Sequelize.DATE, defaultValue: null}
    }, {
        underscored: true,
        tableName: 'tracks'
    });
};
