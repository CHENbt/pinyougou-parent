package com.pinyougou.search.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.pinyougou.search.service.ItemSearchService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/*
在访问服务器的时候，有时候时间可能会长一点，而Spring的默认访问时间是1秒钟，超过1秒就会报出一个错误，
在这里有一个超时时间的配置，这个超时时间的配置位置有两个，一个是在控制层的@Reference注解中加入(timeout=5000)
另外一个就是在服务层的@Servce注解上加入(timeout = 5000)
这个注解的配置是建议配置在@Service上的，配置在服务的提供方，可控性更强
而如果在服务的提供方和消费方都配置了这个，那么就将以服务的消费方的配置为准
 */

@RestController
@RequestMapping("/itemsearch")
public class ItemSearchController {

    @Reference
    private ItemSearchService itemSearchService;

    @RequestMapping("/search")
    public Map search(@RequestBody Map searchMap){
        System.out.println("searchMap:"+searchMap);
        System.out.println("controller"+searchMap.get("keywords"));

        return itemSearchService.search(searchMap);

    }

}
