/*
 * Copyright (C) 2015  Ben Ockmore
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

const React = require('react');
const PageHeader = require('react-bootstrap').PageHeader;

module.exports = React.createClass({
	displayName: 'SearchPage',
	render() {
		'use strict';

		return (
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <form className="whole-page-form form-horizontal">
              <div className="form-group">
                <div className="input-group">
                  <input type="text" name="q" className="form-control"/>
                  <div className="input-group-btn">
                    <button type="submit" className="btn btn-default btn-success"><span className="fa fa-search"></span>&nbsp;Search</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
		);
	}
});
