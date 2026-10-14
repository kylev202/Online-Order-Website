-- Starting catalogue, imported once from the client's product photos.
-- After this the owner manages products in the admin; edits there are never overwritten.

INSERT INTO categories (id, name, position) VALUES ('c-cigarettes', 'CIGARETTES', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-manchester-sapphire-blue', 'c-cigarettes', 'Manchester Sapphire Blue', 'Premium American blend', 1700, 'products/manchester-sapphire-blue.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-marlboro-red', 'c-cigarettes', 'Marlboro Red', '', 1700, 'products/marlboro-red.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-double-happiness', 'c-cigarettes', 'Double Happiness', 'King size · filter tipped', 1700, 'products/double-happiness.webp', '[]', 3);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-manchester-special-edition', 'c-cigarettes', 'Manchester Special Edition', 'Special American blend', 1700, 'products/manchester-special-edition.webp', '[]', 4);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-manchester-lights', 'c-cigarettes', 'Manchester Lights', '', 1700, 'products/manchester-lights.webp', '[]', 5);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-manchester-royal-red', 'c-cigarettes', 'Manchester Royal Red', 'Classic Virginia blend', 1700, 'products/manchester-royal-red.webp', '[]', 6);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-manchester-red', 'c-cigarettes', 'Manchester Red', '', 1700, 'products/manchester-red.webp', '[]', 7);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-marlboro-gold', 'c-cigarettes', 'Marlboro Gold', '', 1700, 'products/marlboro-gold.webp', '[]', 8);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-manchester-double-drive', 'c-cigarettes', 'Manchester Double Drive', 'Premium American blend', 1700, 'products/manchester-double-drive.webp', '[]', 9);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-manchester-reserve', 'c-cigarettes', 'Manchester Reserve', 'Premium American blend', 1700, 'products/manchester-reserve.webp', '[]', 10);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-dunhill-blue', 'c-cigarettes', 'Dunhill Blue', '', 1700, 'products/dunhill-blue.webp', '[]', 11);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-manchester-blue-crush', 'c-cigarettes', 'Manchester Blue Crush', '', 1700, 'products/manchester-blue-crush.webp', '[]', 12);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-marlboro-ice-blast', 'c-cigarettes', 'Marlboro Ice Blast', 'Menthol capsule', 1700, 'products/marlboro-ice-blast.webp', '[]', 13);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-benson-and-hedges-special-filter', 'c-cigarettes', 'Benson & Hedges Special Filter', '', 1700, 'products/benson-and-hedges-special-filter.webp', '[]', 14);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-oscar-super-slim-ice-cold', 'c-cigarettes', 'Oscar Super Slim Ice Cold', 'Super slim · click capsule', 1700, 'products/oscar-super-slim-ice-cold.webp', '[]', 15);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-esse-lights-super-slim', 'c-cigarettes', 'ESSE Lights Super Slim', 'Super slim', 1700, 'products/esse-lights-super-slim.webp', '[]', 16);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-esse-change', 'c-cigarettes', 'ESSE Change', '', 1700, 'products/esse-change.webp', '[]', 17);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-mac-cool-blast', 'c-cigarettes', 'MAC Cool Blast', 'Ice super slims', 1700, 'products/mac-cool-blast.webp', '[]', 18);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-marlboro-w-burst-purple', 'c-cigarettes', 'Marlboro W-Burst Purple', 'Double capsule', 1700, 'products/marlboro-w-burst-purple.webp', '[]', 19);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-esse-menthol-super-slim', 'c-cigarettes', 'ESSE Menthol Super Slim', 'Super slim · menthol', 1700, 'products/esse-menthol-super-slim.webp', '[]', 20);

INSERT INTO categories (id, name, position) VALUES ('c-iget', 'IGET', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-blackberry-pomegranate-cherry', 'c-iget', 'IGET Blackberry Pomegranate Cherry', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-blackberry-pomegranate-cherry.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-blackberry-ice', 'c-iget', 'IGET Blackberry Ice', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-blackberry-ice.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-blueberry-raspberry', 'c-iget', 'IGET Blueberry Raspberry', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-blueberry-raspberry.webp', '[]', 3);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-cherry-pomegranate', 'c-iget', 'IGET Cherry Pomegranate', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-cherry-pomegranate.webp', '[]', 4);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-orange-fanta-soda', 'c-iget', 'IGET Orange Fanta Soda', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-orange-fanta-soda.webp', '[]', 5);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-grapefruit-guava-lemon-ice', 'c-iget', 'IGET Grapefruit Guava Lemon Ice', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-grapefruit-guava-lemon-ice.webp', '[]', 6);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-kiwi-pineapple', 'c-iget', 'IGET Kiwi Pineapple', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-kiwi-pineapple.webp', '[]', 7);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-grape-ice', 'c-iget', 'IGET Grape Ice', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-grape-ice.webp', '[]', 8);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-blueberry-ice', 'c-iget', 'IGET Blueberry Ice', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-blueberry-ice.webp', '[]', 9);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-strawberry-raspberry', 'c-iget', 'IGET Strawberry Raspberry', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-strawberry-raspberry.webp', '[]', 10);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-raspberry-grape', 'c-iget', 'IGET Raspberry Grape', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-raspberry-grape.webp', '[]', 11);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-strawberry-watermelon-ice', 'c-iget', 'IGET Strawberry Watermelon Ice', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-strawberry-watermelon-ice.webp', '[]', 12);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-passion-fruit-peach-ice-tea', 'c-iget', 'IGET Passion Fruit Peach Ice Tea', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-passion-fruit-peach-ice-tea.webp', '[]', 13);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-dynamic-mint', 'c-iget', 'IGET Dynamic Mint', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-dynamic-mint.webp', '[]', 14);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-strawberry-kiwi-ice', 'c-iget', 'IGET Strawberry Kiwi Ice', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-strawberry-kiwi-ice.webp', '[]', 15);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-strawberry-white-peach-ice-mist', 'c-iget', 'IGET Strawberry White Peach Ice Mist', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-strawberry-white-peach-ice-mist.webp', '[]', 16);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-fruity-skittles', 'c-iget', 'IGET Fruity Skittles', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-fruity-skittles.webp', '[]', 17);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-mango-ice', 'c-iget', 'IGET Mango Ice', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-mango-ice.webp', '[]', 18);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-blackberry-yogurt-ice-berry', 'c-iget', 'IGET Blackberry Yogurt Ice Berry', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-blackberry-yogurt-ice-berry.webp', '[]', 19);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-iget-strawberry-cranberry-bliss', 'c-iget', 'IGET Strawberry Cranberry Bliss', 'Bar Pro · 10,000 puffs', 5000, 'products/iget-strawberry-cranberry-bliss.webp', '[]', 20);

INSERT INTO categories (id, name, position) VALUES ('c-alibarbar', 'ALIBARBAR', 3);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-banana-buzz', 'c-alibarbar', 'Alibarbar Banana Buzz', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-banana-buzz.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-strawberry-watermelon', 'c-alibarbar', 'Alibarbar Strawberry Watermelon', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-strawberry-watermelon.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-skittles', 'c-alibarbar', 'Alibarbar Skittles', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-skittles.webp', '[]', 3);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-blueberry-blast', 'c-alibarbar', 'Alibarbar Blueberry Blast', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-blueberry-blast.webp', '[]', 4);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-peach-ice', 'c-alibarbar', 'Alibarbar Peach Ice', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-peach-ice.webp', '[]', 5);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-tobacco', 'c-alibarbar', 'Alibarbar Tobacco', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-tobacco.webp', '[]', 6);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-blackberry-ice', 'c-alibarbar', 'Alibarbar Blackberry Ice', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-blackberry-ice.webp', '[]', 7);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-passionfruit-mango-lime', 'c-alibarbar', 'Alibarbar Passionfruit Mango Lime', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-passionfruit-mango-lime.webp', '[]', 8);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-strawberry-lychee', 'c-alibarbar', 'Alibarbar Strawberry Lychee', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-strawberry-lychee.webp', '[]', 9);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-mango-magic', 'c-alibarbar', 'Alibarbar Mango Magic', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-mango-magic.webp', '[]', 10);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-cool-mint', 'c-alibarbar', 'Alibarbar Cool Mint', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-cool-mint.webp', '[]', 11);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-chupa-strawberry', 'c-alibarbar', 'Alibarbar Chupa Strawberry', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-chupa-strawberry.webp', '[]', 12);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-alibarbar-blueberry-mint', 'c-alibarbar', 'Alibarbar Blueberry Mint', 'Ingot · 9,000 puffs', 5500, 'products/alibarbar-blueberry-mint.webp', '[]', 13);

INSERT INTO categories (id, name, position) VALUES ('c-zyn', 'ZYN', 4);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-apple-mint-mini-dry', 'c-zyn', 'ZYN Apple Mint Mini Dry', 'Nicotine pouches · 2 dots', 2500, 'products/zyn-apple-mint-mini-dry.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-blueberry-mint-slim', 'c-zyn', 'ZYN Blueberry Mint Slim', 'Nicotine pouches · 11 mg', 2500, 'products/zyn-blueberry-mint-slim.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-violet-licorice-slim-3-dots', 'c-zyn', 'ZYN Violet Licorice Slim (3 dots)', 'Nicotine pouches · 3 dots', 2500, 'products/zyn-violet-licorice-slim-3-dots.webp', '[]', 3);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-violet-licorice-slim-2-dots', 'c-zyn', 'ZYN Violet Licorice Slim (2 dots)', 'Nicotine pouches · 2 dots', 2500, 'products/zyn-violet-licorice-slim-2-dots.webp', '[]', 4);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-menthol-ice-slim-6-dots', 'c-zyn', 'ZYN Menthol Ice Slim (6 dots)', 'Nicotine pouches · 6 dots', 2500, 'products/zyn-menthol-ice-slim-6-dots.webp', '[]', 5);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-coffee-mini', 'c-zyn', 'ZYN Coffee Mini', 'Nicotine pouches · 2 dots', 2500, 'products/zyn-coffee-mini.webp', '[]', 6);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-black-cherry-mini-dry', 'c-zyn', 'ZYN Black Cherry Mini Dry', 'Nicotine pouches', 2500, 'products/zyn-black-cherry-mini-dry.webp', '[]', 7);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-cool-mint-mini-dry', 'c-zyn', 'ZYN Cool Mint Mini Dry', 'Nicotine pouches · 2 dots', 2500, 'products/zyn-cool-mint-mini-dry.webp', '[]', 8);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-menthol-ice-slim-5-dots', 'c-zyn', 'ZYN Menthol Ice Slim (5 dots)', 'Nicotine pouches · 5 dots', 2500, 'products/zyn-menthol-ice-slim-5-dots.webp', '[]', 9);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-spearmint-mini-dry', 'c-zyn', 'ZYN Spearmint Mini Dry', 'Nicotine pouches · 2 dots', 2500, 'products/zyn-spearmint-mini-dry.webp', '[]', 10);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-apple-mint-slim', 'c-zyn', 'ZYN Apple Mint Slim', 'Nicotine pouches · 3 dots', 2500, 'products/zyn-apple-mint-slim.webp', '[]', 11);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-red-fruits-slim', 'c-zyn', 'ZYN Red Fruits Slim', 'Nicotine pouches · 2 dots', 2500, 'products/zyn-red-fruits-slim.webp', '[]', 12);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zyn-blackcurrant-ice-slim', 'c-zyn', 'ZYN Blackcurrant Ice Slim', 'Nicotine pouches · 5 dots', 2500, 'products/zyn-blackcurrant-ice-slim.webp', '[]', 13);

INSERT INTO categories (id, name, position) VALUES ('c-velo', 'VELO', 5);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-freezing-peppermint', 'c-velo', 'VELO Freezing Peppermint', 'Nicotine pouches · 5 dots', 2500, 'products/velo-freezing-peppermint.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-tropical-mango', 'c-velo', 'VELO Tropical Mango', 'Nicotine pouches · 5 dots', 2500, 'products/velo-tropical-mango.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-peppermint-storm', 'c-velo', 'VELO Peppermint Storm', 'Nicotine pouches · 4 dots', 2500, 'products/velo-peppermint-storm.webp', '[]', 3);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-crispy-peppermint', 'c-velo', 'VELO Crispy Peppermint', 'Nicotine pouches · 3 dots', 2500, 'products/velo-crispy-peppermint.webp', '[]', 4);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-orange-spark', 'c-velo', 'VELO Orange Spark', 'Nicotine pouches · 4 dots', 2500, 'products/velo-orange-spark.webp', '[]', 5);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-purple-grape', 'c-velo', 'VELO Purple Grape', 'Nicotine pouches · 3 dots', 2500, 'products/velo-purple-grape.webp', '[]', 6);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-mango-flame', 'c-velo', 'VELO Mango Flame', 'Nicotine pouches · 3 dots', 2500, 'products/velo-mango-flame.webp', '[]', 7);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-bright-spearmint', 'c-velo', 'VELO Bright Spearmint', 'Nicotine pouches · 1 dot', 2500, 'products/velo-bright-spearmint.webp', '[]', 8);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-blue-raspberry', 'c-velo', 'VELO Blue Raspberry', 'Nicotine pouches · 3 dots', 2500, 'products/velo-blue-raspberry.webp', '[]', 9);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-cherry-ice', 'c-velo', 'VELO Cherry Ice', 'Nicotine pouches · 2 dots', 2500, 'products/velo-cherry-ice.webp', '[]', 10);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-velo-dark-blackcurrant', 'c-velo', 'VELO Dark Blackcurrant', 'Nicotine pouches · 3 dots', 2500, 'products/velo-dark-blackcurrant.webp', '[]', 11);

INSERT INTO categories (id, name, position) VALUES ('c-filter-tips', 'FILTER TIPS', 6);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ventii-extra-long-micro-slim-filter-tips', 'c-filter-tips', 'Ventii Extra Long Micro Slim Filter Tips', 'Per bag', 300, 'products/ventii-extra-long-micro-slim-filter-tips.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ventii-slim-filter-tips', 'c-filter-tips', 'Ventii Slim Filter Tips', 'Per bag', 300, 'products/ventii-slim-filter-tips.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ventii-super-slim-filter-tips', 'c-filter-tips', 'Ventii Super Slim Filter Tips', 'Per bag', 300, 'products/ventii-super-slim-filter-tips.webp', '[]', 3);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ventii-micro-slim-filter-tips', 'c-filter-tips', 'Ventii Micro Slim Filter Tips', 'Per bag', 300, 'products/ventii-micro-slim-filter-tips.webp', '[]', 4);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ventii-regular-filter-tips', 'c-filter-tips', 'Ventii Regular Filter Tips', 'Per bag', 300, 'products/ventii-regular-filter-tips.webp', '[]', 5);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ranch-micro-slim-filter-tips', 'c-filter-tips', 'Ranch Micro Slim Filter Tips', '130 tips per bag', 300, 'products/ranch-micro-slim-filter-tips.webp', '[]', 6);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ranch-slim-filter-tips', 'c-filter-tips', 'Ranch Slim Filter Tips', '120 tips per bag', 300, 'products/ranch-slim-filter-tips.webp', '[]', 7);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ranch-extra-long-supa-slim-filter-tips', 'c-filter-tips', 'Ranch Extra Long Supa Slim Filter Tips', '80 tips per bag', 300, 'products/ranch-extra-long-supa-slim-filter-tips.webp', '[]', 8);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ranch-extra-long-nano-slim-filter-tips', 'c-filter-tips', 'Ranch Extra Long Nano Slim Filter Tips', '80 tips per bag', 300, 'products/ranch-extra-long-nano-slim-filter-tips.webp', '[]', 9);

INSERT INTO categories (id, name, position) VALUES ('c-papers', 'PAPERS', 7);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ocb-slim-premium-papers', 'c-papers', 'OCB Slim Premium Papers', 'King size slim', 300, 'products/ocb-slim-premium-papers.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zig-zag-red-papers', 'c-papers', 'Zig-Zag Red Papers', '', 300, 'products/zig-zag-red-papers.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-ocb-slim-premium-plus-filters', 'c-papers', 'OCB Slim Premium + Filters', '32 papers + 32 filter tips', 300, 'products/ocb-slim-premium-plus-filters.webp', '[]', 3);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zig-zag-red-king-size-papers', 'c-papers', 'Zig-Zag Red King Size Papers', 'King size', 300, 'products/zig-zag-red-king-size-papers.webp', '[]', 4);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-zig-zag-blue-slim-papers', 'c-papers', 'Zig-Zag Blue Slim Papers', 'Slim', 300, 'products/zig-zag-blue-slim-papers.webp', '[]', 5);

INSERT INTO categories (id, name, position) VALUES ('c-raw-papers', 'RAW PAPERS', 8);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-raw-black-king-size-slim-papers', 'c-raw-papers', 'RAW Black King Size Slim Papers', 'Classic black · king size slim', 400, 'products/raw-black-king-size-slim-papers.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-raw-pre-rolled-tips', 'c-raw-papers', 'RAW Pre-Rolled Tips', '100 tips per tin', 400, 'products/raw-pre-rolled-tips.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-raw-black-connoisseur-king-size-slim', 'c-raw-papers', 'RAW Black Connoisseur King Size Slim', 'Papers + tips', 400, 'products/raw-black-connoisseur-king-size-slim.webp', '[]', 3);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-raw-perforated-wide-tips', 'c-raw-papers', 'RAW Perforated Wide Tips', 'Unrefined soft tips', 400, 'products/raw-perforated-wide-tips.webp', '[]', 4);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-raw-black-rolling-tray', 'c-raw-papers', 'RAW Black Rolling Tray', 'Metal rolling tray', 400, 'products/raw-black-rolling-tray.webp', '[]', 5);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-raw-original-tips', 'c-raw-papers', 'RAW Original Tips', 'Natural unrefined tips', 400, 'products/raw-original-tips.webp', '[]', 6);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-raw-classic-cones-1-quarter', 'c-raw-papers', 'RAW Classic Cones 1¼', 'Pre-rolled cones · 6 per pack', 400, 'products/raw-classic-cones-1-quarter.webp', '[]', 7);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-raw-classic-cones-king-size', 'c-raw-papers', 'RAW Classic Cones King Size', 'Pre-rolled cones', 400, 'products/raw-classic-cones-king-size.webp', '[]', 8);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-raw-black-cones-1-quarter', 'c-raw-papers', 'RAW Black Cones 1¼', 'Pre-rolled cones · 6 per pack', 400, 'products/raw-black-cones-1-quarter.webp', '[]', 9);

INSERT INTO categories (id, name, position) VALUES ('c-cream-charger', 'CREAM CHARGER', 9);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-xtreme-whip-cream-chargers', 'c-cream-charger', 'Xtreme Whip Cream Chargers', '10 chargers · mint flavour', 900, 'products/xtreme-whip-cream-chargers.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-skywhip-pro-max', 'c-cream-charger', 'SkyWhip Pro Max', 'Cream charger cylinder', 4500, 'products/skywhip-pro-max.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-party-balloons', 'c-cream-charger', 'Party Balloons', 'Assorted colours', 500, 'products/party-balloons.webp', '[]', 3);

INSERT INTO categories (id, name, position) VALUES ('c-scales', 'SCALES', 10);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-digital-pocket-scale-orange', 'c-scales', 'Digital Pocket Scale – Orange', 'With calibration weight', 4000, 'products/digital-pocket-scale-orange.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-digital-pocket-scale-silver', 'c-scales', 'Digital Pocket Scale – Silver', 'With calibration weight', 4000, 'products/digital-pocket-scale-silver.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-enuff-professional-digital-scale', 'c-scales', 'Enuff Professional Digital Scale', '', 4000, 'products/enuff-professional-digital-scale.webp', '[]', 3);

INSERT INTO categories (id, name, position) VALUES ('c-ash-tray', 'ASH TRAY', 11);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-blink-casino-glass-ashtray', 'c-ash-tray', 'Blink Casino Glass Ashtray', 'Assorted designs', 1500, 'products/blink-casino-glass-ashtray.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-printed-glass-ashtray', 'c-ash-tray', 'Printed Glass Ashtray', 'Assorted designs', 1500, 'products/printed-glass-ashtray.webp', '[]', 2);

INSERT INTO categories (id, name, position) VALUES ('c-satya-scents', 'SATYA SCENTS', 12);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-satya-incense-classic-scents', 'c-satya-scents', 'Satya Incense – Classic Scents', 'Tree of Life, Spiritual Aura, Nirvana, Nag Champa, White Sage, Mystic Yoga or Reiki Power. Tell us your scent in the delivery instructions.', 300, 'products/satya-incense-classic-scents.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-satya-incense-nag-champa-and-more', 'c-satya-scents', 'Satya Incense – Nag Champa & More', 'Natural, Nag Champa, For You, Super Hit or Mantram. Tell us your scent in the delivery instructions.', 300, 'products/satya-incense-nag-champa-and-more.webp', '[]', 2);

INSERT INTO categories (id, name, position) VALUES ('c-bongs', 'BONGS', 13);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-glass-bong-clear', 'c-bongs', 'Glass Bong – Clear', 'Bubble base · metal stem', 3000, 'products/glass-bong-clear.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-glass-bong-rainbow', 'c-bongs', 'Glass Bong – Rainbow', 'Bubble base · metal stem', 3000, 'products/glass-bong-rainbow.webp', '[]', 2);

INSERT INTO categories (id, name, position) VALUES ('c-sweet-glass-pipes', 'SWEET GLASS PIPES', 14);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-sweet-puff-glass-pipe-colours', 'c-sweet-glass-pipes', 'Sweet Puff Glass Pipe – Colours', 'Assorted colours', 1500, 'products/sweet-puff-glass-pipe-colours.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-sweet-puff-glass-pipe-clear', 'c-sweet-glass-pipes', 'Sweet Puff Glass Pipe – Clear', '', 1500, 'products/sweet-puff-glass-pipe-clear.webp', '[]', 2);

INSERT INTO categories (id, name, position) VALUES ('c-metal-pipe-grinder', 'METAL PIPE GRINDER', 15);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-long-metal-pipe', 'c-metal-pipe-grinder', 'Long Metal Pipe', 'Assorted colours', 1200, 'products/long-metal-pipe.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-champ-high-pipe-and-grinder-kit', 'c-metal-pipe-grinder', 'Champ High Pipe & Grinder Kit', 'Pipe, grinder and screens', 1200, 'products/champ-high-pipe-and-grinder-kit.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-metal-pipe-black', 'c-metal-pipe-grinder', 'Metal Pipe – Black', '', 1200, 'products/metal-pipe-black.webp', '[]', 3);

INSERT INTO categories (id, name, position) VALUES ('c-metal-grinder', 'METAL GRINDER', 16);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-crank-metal-grinder', 'c-metal-grinder', 'Crank Metal Grinder', '4-piece · assorted colours', 1900, 'products/crank-metal-grinder.webp', '[]', 1);

INSERT INTO categories (id, name, position) VALUES ('c-grinders', 'GRINDERS', 17);

INSERT INTO categories (id, name, position) VALUES ('c-jet-lighters', 'JET LIGHTERS', 18);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-mini-torch-lighter', 'c-jet-lighters', 'Mini Torch Lighter', 'Assorted colours', 1500, 'products/mini-torch-lighter.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-windproof-jet-lighter', 'c-jet-lighters', 'Windproof Jet Lighter', 'Assorted colours', 1500, 'products/windproof-jet-lighter.webp', '[]', 2);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-tiko-table-torch-lighter', 'c-jet-lighters', 'Tiko Table Torch Lighter', '', 3500, 'products/tiko-table-torch-lighter.webp', '[]', 3);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-triple-jet-torch-lighter', 'c-jet-lighters', 'Triple Jet Torch Lighter', 'Black or gold', 3500, 'products/triple-jet-torch-lighter.webp', '[]', 4);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-jobon-torch-lighter-gold', 'c-jet-lighters', 'Jobon Torch Lighter – Gold', '', 3500, 'products/jobon-torch-lighter-gold.webp', '[]', 5);

INSERT INTO categories (id, name, position) VALUES ('c-bic-lighters', 'BIC LIGHTERS', 19);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-bic-lighter', 'c-bic-lighters', 'BIC Lighter', 'Assorted colours', 500, 'products/bic-lighter.webp', '[]', 1);

INSERT INTO categories (id, name, position) VALUES ('c-bags', 'BAGS', 20);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-apple-1515-zip-bags', 'c-bags', 'Apple 1515 Zip Bags', 'Small resealable bags', 700, 'products/apple-1515-zip-bags.webp', '[]', 1);

INSERT INTO categories (id, name, position) VALUES ('c-condoms', 'CONDOMS', 21);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-lifestyles-regular-10-pack', 'c-condoms', 'LifeStyles Regular 10 Pack', 'Comfort fit', 1900, 'products/lifestyles-regular-10-pack.webp', '[]', 1);
INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES ('p-skyn-original-10-pack', 'c-condoms', 'SKYN Original 10 Pack', 'Non-latex · natural feeling', 1900, 'products/skyn-original-10-pack.webp', '[]', 2);
