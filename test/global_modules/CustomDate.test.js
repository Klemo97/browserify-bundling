import CustomDate from "../../webroot/js/global_modules/CustomDate";

describe('CustomDate', () => {
    it('should return date in mysql format', function () {
        const instance = new CustomDate(new Date('2021-01-01'))

        expect(instance.mysqlDate).toMatch('2021-01-01')
    });
})