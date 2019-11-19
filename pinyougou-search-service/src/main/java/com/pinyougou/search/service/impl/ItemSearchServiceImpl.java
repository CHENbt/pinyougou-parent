package com.pinyougou.search.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.search.service.ItemSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.*;

import java.util.*;

@Service(timeout = 5000)
public class ItemSearchServiceImpl implements ItemSearchService {

    @Autowired
    private SolrTemplate solrTemplate;

    @Override
    public Map search(Map searchMap) {

        Map map = new HashMap();
/*
        Query query = new SimpleQuery("*:*");
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);
        ScoredPage<TbItem> page = solrTemplate.queryForPage(query, TbItem.class);

        map.put("rows",page.getContent());

        System.out.println("service"+map.get("rows"));*/

        //空格处理
        String keywords = (String) searchMap.get("keywords");
        System.out.println("keywords:"+keywords);
        //去掉空格
        if("null".equals(keywords)){
            searchMap.put("keywords",keywords.replace(" ",""));
        }


        //1. 查询列表 追加map列表
        map.putAll(searchLsit(searchMap));
        //2. 分组查询分类列表
        List<String> categotryList = searchCatagotryList(searchMap);
        map.put("categoryList",categotryList);

        //3. 查询品牌和规格列表
        String category = (String) searchMap.get("category");
        if(!category.equals("")){
            map.putAll(searchBrandAanSpecList(category));
        }else{
            if(categotryList.size() > 0 ){
                map.putAll( searchBrandAanSpecList(categotryList.get(0)));
            }
        }


        return map;
    }


    //查询列表
    public Map searchLsit(Map searchMap){

        Map map = new HashMap();

        //高亮选项初始化
        HighlightQuery query = new SimpleHighlightQuery();
        HighlightOptions highlightOptions = new HighlightOptions().addField("item_title");
        highlightOptions.setSimplePrefix("<em style='color:red'>"); //前缀
        highlightOptions.setSimplePostfix("</em>");//后缀
        query.setHighlightOptions(highlightOptions);  //为查询对象设置高亮显示对象

        //1.1关键字查询
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);

        //1.2 按章商品分类过滤
        if(!"".equals(searchMap.get("category"))) { //如果用户选择了进行商品分类
            FilterQuery filterQuery = new SimpleFilterQuery();
            Criteria filterCriteria = new Criteria("item_category").is(searchMap.get("category"));
            filterQuery.addCriteria(filterCriteria);
            query.addFilterQuery(filterQuery);
        }

        //1.2 按品牌过滤
        if(!"".equals(searchMap.get("brand"))) { //如果用户选择了品牌
            FilterQuery filterQuery = new SimpleFilterQuery();
            Criteria filterCriteria = new Criteria("item_brand").is(searchMap.get("brand"));
            filterQuery.addCriteria(filterCriteria);
            query.addFilterQuery(filterQuery);
        }

        //1.4 按规格过滤
        if(!"".equals(searchMap.get("price"))){
            Map<String,String> specMap = (Map<String, String>) searchMap.get("spec");
            for(String key : specMap.keySet()){

                FilterQuery filterQuery = new SimpleFilterQuery();
                Criteria filterCriteria = new Criteria("item_spec_"+key).is(specMap.get(key));
                filterQuery.addCriteria(filterCriteria);
                query.addFilterQuery(filterQuery);

            }
        }


        //1.5 按价格过滤
        if(!"".equals(searchMap.get("price"))){
            String[] price = ((String) searchMap.get("price")).split("-");
            System.out.println(Arrays.toString(price));
            if(!price[0].equals("0")){ //如果最低价格不到等于0
                FilterQuery filterQuery = new SimpleFilterQuery();
                Criteria filterCriteria = new Criteria("item_price").greaterThanEqual(price[0]);
                filterQuery.addCriteria(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
            if(!price[1].equals("*")){ //如果最高价格不到等于*
                FilterQuery filterQuery = new SimpleFilterQuery();
                Criteria filterCriteria = new Criteria("item_price").lessThanEqual(price[1]);
                filterQuery.addCriteria(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
        }

        //1.6 分页
        Integer pageNo = (Integer) searchMap.get("pageNo"); //获取页码
        if(pageNo == null){
            pageNo = 1;
        }
        Integer pageSize = (Integer) searchMap.get("pageSize"); //获取页面数据个数
        if(pageSize == null){
            pageSize = 20;
        }

        //1.7 排序

        String sortValue = (String) searchMap.get("sort");  //升序ASC,降序DESC
        String sortField = (String) searchMap.get("sortField");
        System.out.println("w"+sortValue);

        if(sortValue != null && !"".equals(sortValue)){
            if(sortValue.equals("ASC")){
                System.out.println(sortValue);
                Sort sort = new Sort(Sort.Direction.ASC,"item_"+sortField);
                query.addSort(sort);

            }
            if(sortValue.equals("DESC")){
                System.out.println(sortValue);
                Sort sort = new Sort(Sort.Direction.DESC,"item_"+sortField);
                query.addSort(sort);

            }
        }


        /*
        计算分页的起始页数是有一个固定的公式的
        (页码 -1 ) * 页面数据数
         */
        query.setOffset((pageNo - 1) * pageSize); //起始索引
        query.setRows(pageSize); //每页记录数

        // **************获取高亮结果集***************
        //返回高亮页对象
        HighlightPage<TbItem> highlightPage = solrTemplate.queryForHighlightPage(query, TbItem.class);

        //高亮入口集合(每条记录)
        List<HighlightEntry<TbItem>> entryList = highlightPage.getHighlighted();
        for(HighlightEntry<TbItem> entry :entryList ){
            //获取高亮列表(根据高亮域对象)
            List<HighlightEntry.Highlight> highlightList = entry.getHighlights();
            TbItem item = entry.getEntity();
            if(highlightList.size() > 0 && highlightList.get(0).getSnipplets().size() > 0){
                item.setTitle( highlightList.get(0).getSnipplets().get(0));
            }

            /*for(HighlightEntry.Highlight h : highlightList){
                List<String> snipplets = h.getSnipplets();  //每个域有可能存储多值
                System.out.println(snipplets);
            }*/


        }
        map.put("rows",highlightPage.getContent());
        map.put("totalPages", highlightPage.getTotalPages()); //总页数
        map.put("total",highlightPage.getTotalElements());  //总记录数
        return map;
    }

    /**
     * 分组查询（查询商品的分类的列表）
     * @param searchMap
     * @return
     */
    private List<String> searchCatagotryList(Map searchMap){

        List<String> list = new ArrayList<String>();

        Query query = new SimpleQuery("*:*");
        // 关键字查询，相当于where条件
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);

        //设置分组选项
        GroupOptions groupOptions = new GroupOptions().addGroupByField("item_category"); //group by
        query.setGroupOptions(groupOptions);

        /*
        这里可以设置多个分组选选项，而在获得结果的时候是可以分别获取的，在下边提取名称必须是上面的设置过的分组名称 比如"item_category"
         */

        //获得分组页
        GroupPage<TbItem> page = solrTemplate.queryForGroupPage(query, TbItem.class);

//        page.getContent(); 这个方法不会获得任何的结果，得到的是一个空 ，他是继承与父接口的方法

        //获得分组结果对象
        GroupResult<TbItem> groupResult = page.getGroupResult("item_category");

        //获取分组入口页
        Page<GroupEntry<TbItem>> groupEntries = groupResult.getGroupEntries();

        //获取分组入口集合
        List<GroupEntry<TbItem>> content = groupEntries.getContent();

        for(GroupEntry entry : content){
            list.add(entry.getGroupValue()); //将分组的结果添加到返回值中
        }

        return list;
    }


    @Autowired
    private RedisTemplate redisTemplate;

    /**
     * 根据商品分类名称查询品牌和规格列表
     * @param catetory  商品分类名称
     * @return
     */
    private Map searchBrandAanSpecList(String catetory){
        Map map = new HashMap();

        //1根据商品跟类名称得到模版ID
        Long templateId = (Long) redisTemplate.boundHashOps("itemCat").get(catetory);
        if(templateId != null){
            //根据模版ID获取品牌列表
            List brandList = (List) redisTemplate.boundHashOps("brandList").get(templateId);

            map.put("brandList",brandList);

            //根据模版ID获取规格列表
            List specList = (List) redisTemplate.boundHashOps("specList").get(templateId);

            map.put("specList",specList);
        }

        return map;

    }


    @Override
    public void importList(List list) {
        System.out.println(list);
        solrTemplate.saveBeans(list);
        solrTemplate.commit();
    }

    /**
     * 删除商品列表
     * @param goodsIds  SPUid
     */
    public void deleteByGoodsIds(List goodsIds){

        Query query = new SimpleQuery("*:*");
        Criteria criteria = new Criteria("item_goodsid").in(goodsIds);
        query.addCriteria(criteria);
        solrTemplate.delete(query);
        solrTemplate.commit();

    }
}
