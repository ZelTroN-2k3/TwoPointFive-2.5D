/**
 * Weltmeister - Multiple entity select and move
 * @author Ash Blue (Twitter @ashbluewd)
 * @src https://gist.github.com/ashblue/9901165
 *
 * Allows you to select and move multiple entities in Weltmeister with a single command
 *
 * Quick usage instructions
 * - Select the entity layer
 * - Hold down shift
 * - Click'n drag to select the area of entities to create a group
 * - Click'n drag one of the selected entities to move the group
 *
 * In order to use this you'll need to tweak Weltmeister slightly to support plugins. See
 * this article for details http://impactjs.com/forums/code/weltmeister-plugins-setting-a-standard
 *
 */
ig.module(
        'weltmeister.plugins.entity-select'
    ).requires(
        'weltmeister.weltmeister',
        'weltmeister.edit-entities',
        'weltmeister.undo'
    ).defines(function(){
        'use strict';

        $(document).bind('keyup keydown', function (e) { _shifted = e.shiftKey; });
        $('#canvas').mousedown(function () { _clicked = true; });
        $('#canvas').mouseup(function () { _moveGroup = false; _clicked = false; });

        var _shifted = false; // Is shift pressed
        var _clicked = false; // Is mouse click pressed?
        var _boundingBox = {
            on: false,
            x1: null,
            y1: null,
            x2: null,
            y2: null
        }; // Should a bounding box be drawn
        var _stackSelect = []; // Special collection of multiple selected entities
        var _moveGroup = false;
        var _moveStart = null;
        var _moveGroupDirty = false;

        var _private = {
            stackToggle: function (ent) {
                var removed  = this.stackRemove(ent);
                if (!removed) this.stackAdd(ent);
            },

            stackAdd: function (ent) {
                _stackSelect.push(ent);
                ent._selected = true;

                return true;
            },

            stackRemove: function (ent) {
                ent._selected = false;

                for (var i = 0, len = _stackSelect.length; i < len; i++) {
                    if (_stackSelect[i] === ent) {
                        _stackSelect.splice(i, 1);
                        return true;
                    }
                }

                return false;
            },

            stackReset: function () {
                for (var i = 0, len = _stackSelect.length; i < len; i++) {
                    _stackSelect[i]._selected = false;
                }

                _stackSelect = [];
            },

            /**
             * Create a square bounding box from an array of x and y points
             * @param {array} A collection of objects with x and y coordinates {x, y}
             * @returns {object} Square formatted as {x, y, width, height} from the given vertices
             */
            getBoundingBox: function (vertices) {
                // Setup basic test properties
                var xMin = Number.POSITIVE_INFINITY,
                    yMin = Number.POSITIVE_INFINITY,
                    xMax = 0,
                    yMax = 0;

                // Loop through and test all vertices to generate x and y coordinates
                for (var i = 0, len = vertices.length; i < len; i++) {
                    // Test x
                    if (vertices[i].x < xMin) {
                        xMin = vertices[i].x;
                    }
                    if (vertices[i].x > xMax) {
                        xMax = vertices[i].x;
                    }

                    // Test y
                    if (vertices[i].y < yMin) {
                        yMin = vertices[i].y;
                    }
                    if (vertices[i].y > yMax) {
                        yMax = vertices[i].y;
                    }
                }

                // Create a square from the passed data
                return {
                    x: xMin,
                    y: yMin,
                    width: xMax - xMin,
                    height: yMax - yMin
                };
            },

            overlap: function (x1, y1, width1, height1, x2, y2, width2, height2) {
                return x1 < x2 + width2 &&
                    x1 + width1 > x2 &&
                    y1 < y2 + height2 &&
                    y1 + height1 > y2;
            },

            entRecordPos: function () {
                for (var i = 0, len = _stackSelect.length; i < len; i++) {
                    _stackSelect[i].posStart = {
                        x: _stackSelect[i].pos.x,
                        y: _stackSelect[i].pos.y
                    };
                }
            },

            entMove: function (ent, x, y) {
                // new position?
                x = Math.round(x);
                y = Math.round(y);

                if( ent.pos.x !== x || ent.pos.y !== y ) {
                    ent.pos.x = x;
                    ent.pos.y = y;
                    _moveGroupDirty = true;
                }
            }
        };

        wm.EditEntities.inject({
            selectEntity: function (entity) {
                if (_shifted && entity) {
                    _private.stackToggle(entity);
                    this.selectedEntity = null;

                } else if (_shifted) {
                    this.selectedEntity = null;
                    _private.stackReset();
                    _boundingBox.on = true;
                    _boundingBox.x1 = ig.input.mouse.x;
                    _boundingBox.y1 = ig.input.mouse.y;

                } else {
                    if (entity && !entity._selected) {
                        _private.stackReset();
                        this.parent(entity);
                    } else if (entity) {
                        _moveGroup = true;
                        _moveStart = {
                            x: ig.input.mouse.x + ig.game.screen.x,
                            y: ig.input.mouse.y + ig.game.screen.y
                        };

                        _private.entRecordPos();

                    } else {
                        _private.stackReset();
                        this.parent(entity);
                    }
                }
            },

            drawEntity: function (ent) {
                this.parent(ent);

                if (ent._selected) {
                    ig.system.context.lineWidth = 1;
                    ig.system.context.strokeStyle = 'rgba(0, 255, 255, 1)';
                    ig.system.context.strokeRect(
                        ig.system.getDrawPos(ent.pos.x - ig.game.screen.x) - 0.5,
                        ig.system.getDrawPos(ent.pos.y - ig.game.screen.y) - 0.5,
                        ent.size.x * ig.system.scale + 1,
                        ent.size.y * ig.system.scale + 1
                    );
                }
            }
        });

        wm.EditMap.inject({
            draw: function () {
                this.parent();

                if (this.name === 'collision') {
                    // Logic to draw the bounding box
                    if (_boundingBox.on) {
                        _boundingBox.x2 = ig.input.mouse.x;
                        _boundingBox.y2 = ig.input.mouse.y;

                        ig.system.context.lineWidth = 1;
                        ig.system.context.strokeStyle = 'rgba(0, 255, 255, 1)';
                        ig.system.context.strokeRect(
                            -ig.system.getDrawPos(this.scroll.x - _boundingBox.x1 - ig.game.screen.x) - 0.5,
                            -ig.system.getDrawPos(this.scroll.y - _boundingBox.y1 - ig.game.screen.y) - 0.5,
                            (_boundingBox.x2 - _boundingBox.x1) * ig.system.scale + 1,
                            (_boundingBox.y2 - _boundingBox.y1) * ig.system.scale + 1
                        );
                    }

                    // Selecting a group of items
                    if (!_clicked && _boundingBox.on) {
                        _boundingBox.on = false;

                        var box = _private.getBoundingBox([
                            {
                                x: _boundingBox.x1,
                                y: _boundingBox.y1
                            },
                            {
                                x:_boundingBox.x2,
                                y: _boundingBox.y2
                            }
                        ]);

                        var ent = ig.game.entities.entities;
                        for (var i = 0, len = ent.length; i < len; i++) {
                            if (_private.overlap(box.x + ig.game.screen.x, box.y + ig.game.screen.y, box.width, box.height,
                                ent[i].pos.x, ent[i].pos.y, ent[i].size.x, ent[i].size.y)) {
                                _private.stackAdd(ent[i]);
                            }
                        }
                    }

                    // Logic for moving a group of selected (stops moving with mouse up event)
                    if (_moveGroup) {
                        for (var i = 0, len = _stackSelect.length; i < len; i++) {
                            _private.entMove(
                                _stackSelect[i],
                                _stackSelect[i].posStart.x + (ig.input.mouse.x - _moveStart.x + ig.game.screen.x),
                                _stackSelect[i].posStart.y + (ig.input.mouse.y - _moveStart.y + ig.game.screen.y)
                            );
                        }
                    } else if (_moveGroupDirty) {
                        ig.game.undo.commitGroupMove();
                        _moveGroupDirty = false;
                    }
                }
            }
        });

        wm.Undo.GROUP_MOVE = 20;
        wm.Undo.inject({
            commitGroupMove: function () {
                console.log('committed');

                var entGroup = []; // Deep copy of the selected entities
                var entPosOld = []; // Original position of the entity
                var entPos = []; // New position of the entity
                for (var i = 0, len = _stackSelect.length; i < len; i++) {
                    entGroup.push(_stackSelect[i]);
                    entPosOld.push({
                        x: _stackSelect[i].posStart.x,
                        y: _stackSelect[i].posStart.y
                    });
                    entPos.push({
                        x: _stackSelect[i].pos.x,
                        y: _stackSelect[i].pos.y
                    });
                }

                this.commit({
                    type: wm.Undo.GROUP_MOVE,
                    time: Date.now(),
                    entity: entGroup,
                    old: entPosOld,
                    current: entPos
                });
            },

            undo: function () {
                var action = this.chain[ this.chain.length - this.rpos - 1 ];
                if (action) {
                    if (action.type === wm.Undo.GROUP_MOVE) {
                        for (var i = 0, len = action.entity.length; i < len; i++) {
                            action.entity[i].pos.x = action.old[i].x;
                            action.entity[i].pos.y = action.old[i].y;
                        }
                    }
                }

                this.parent();
            },

            redo: function () {
                if( !this.rpos ) {
                    return;
                }

                var action = this.chain[ this.chain.length - this.rpos ];
                if (action) {
                    if (action.type === wm.Undo.GROUP_MOVE) {
                        for (var i = 0, len = action.entity.length; i < len; i++) {
                            action.entity[i].pos.x = action.current[i].x;
                            action.entity[i].pos.y = action.current[i].y;
                        }
                    }
                }

                this.parent();
            }
        });
    });