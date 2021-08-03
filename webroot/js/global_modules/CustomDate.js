import _ from 'lodash'
import {TestClass} from "./CustomDate2";

export default class CustomDate {
    constructor(date) {
        this.date = date
    }

    get mysqlDate() {
        return this.date.toISOString().substr(0, 10)
    }

    lodashTest() {
        return _.join(['hello', 'world', this.mysqlDate, TestClass.TESTS], ' ')
    }
}