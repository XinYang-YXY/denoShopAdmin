USE denoshop;

INSERT INTO productstats (id, `year`, target, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, `dec`, hackingProductId)
	VALUES 
	(1, 2019, 100, 16, 17, 19, 15, 17, 14, 16, 15, 15, 16, 17, 17, 1),
	(2, 2020, 150, 7, 8, 9, 9, 10, 11, 10, 9, 12, 12, 13, 12, 1),
	(3, 2019, 90, 13, 14, 14, 15, 17, 16, 16, 14, 14, 15, 14, 14, 2),
	(4, 2020, 150, 5, 6, 8, 8, 9, 10, 10, 9, 11, 10, 10, 11, 2),
	(5, 2019, 60, 7, 7, 9, 10, 7, 9, 10, 11, 12, 15, 10, 12, 3),
	(6, 2020, 150, 10, 11, 12, 13, 14, 13, 13, 12, 12, 12, 15, 15, 3),
	(7, 2019, 100, 16, 17, 19, 15, 17, 14, 16, 15, 15, 16, 17, 17, 4),
	(8, 2020, 120, 7, 8, 9, 9, 10, 11, 10, 9, 12, 12, 13, 12, 4);
    
INSERT INTO productratings (id, `year`, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, hackingProductId)
	VALUES
    (1, 2020, 1, 1.2, 1.6, 1.4, 1.4, 1.3, 1.4, 1.2, 1, 1, 0.9, 0.9, 0.8),
    (2, 2020, 1, 1, 1.1, 1.1, 1.3, 1.4, 1.2, 1.2, 1.1, 1, 1, 1.1, 1.1),
    (3, 2020, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3),
    (4, 2020, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4);