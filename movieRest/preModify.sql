alter table film_inventory
  drop foreign key fk_inventory_film;

alter table film_category 
  drop foreign key fk_film_category_category;

alter table film_category 
  add constraint fk_film_category_category 
  foreign key (category_id) references category(category_id) 
  on delete cascade on update    cascade;
  
alter table film_category 
  drop foreign key fk_film_category_film;

alter table film_category 
  add constraint fk_film_category_film 
  foreign key (film_id) references film(film_id) 
  on delete cascade on update cascade;

alter table film_actor 
  drop foreign key fk_film_actor_film;

alter table film_actor 
  add constraint fk_film_actor_film 
  foreign key (film_id) references film(film_id) 
  on delete cascade on update cascade;
  
alter table film_actor 
  drop foreign key fk_film_actor_actor;
  
alter table film_actor 
  add constraint fk_film_actor_actor 
  foreign key (actor_id) references actor(actor_id) 
  on delete cascade on update cascade;