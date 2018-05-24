SELECT 
      TIMESTAMP_TRUNC(data.timestamp, HOUR, 'America/Cuiaba') data_hora,
      avg(data.temp) as avg_temp,
      avg(data.humidity) as avg_hum,
      avg(data.light) as avg_light,
      min(data.temp) as min_temp,
      max(data.temp) as max_temp,
      min(data.humidity) as min_hum,
      max(data.humidity) as max_hum,
      min(data.light) as min_light,
      max(data.light) as max_light,
      count(*) as data_points      
    FROM `iot2analytics-205013.weather_station_iot.raw_data` data
    WHERE data.timestamp between timestamp_sub(current_timestamp, INTERVAL 7 DAY) and current_timestamp()
    group by data_hora
    order by data_hora