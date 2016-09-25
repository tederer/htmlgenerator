/* global DateComparator */

describe('dateComparator', function() {
	
   describe('compare', function() {
      
      it('should return 0 when both dates are the same', function() {
        expect(DateComparator.compare('12/27/2015 16:37:01', '12/27/2015 16:37:01')).to.be.equal(0);
      });
      
      it('should return -1 when the first date is before the second', function() {
        expect(DateComparator.compare('12/27/2015 16:37:00', '12/27/2015 16:37:01')).to.be.equal(-1);
      }); 
      
      it('should return 1 when the first date is after the second', function() {
        expect(DateComparator.compare('12/27/2015 16:37:02', '12/27/2015 16:37:01')).to.be.equal(1);
      });
   });
 });
