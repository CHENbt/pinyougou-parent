package com.pinyougou.cart.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSON;
import com.pinyougou.cart.service.CartService;
import com.pinyougou.pojogroup.Cart;
import com.pinyougou.util.CookieUtil;
import entity.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;


    @Reference(timeout = 6000)
    private CartService cartService;


    @RequestMapping("/addGoodsToCartList")
    @CrossOrigin(origins = "http://localhost:9105",allowCredentials = "true")
    public Result addGoodsToCartList(Long itemId, Integer num){

        //spring 4.2 后出现的注解的方式可以代替一下两句代码进行跨域请求的操作

        /*
        如果想所有的服务器的请求都可以访问到，就将头信息的值设置为*，就可以使所有的域都能访问到
        当此方法不需要操作cookie，加上下面的头信息就可以，但是如果需要操作cookie，那就还需要加上一句话
         */
       // response.setHeader("Access-Control-Allow-Origin","http://localhost:9105");
        /*
        如果操作需要cookie，必须加上一下代码，允许提交凭证
        还有如果需要些这一句代码，那么上面的Access-Control-Allow-Origin值不能是*，只能是确切的域
         */
        //response.setHeader("Access-Control-Allow-Credentials","true");

        //当前登录人账号
        String name = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("当前登录人："+name);

        try {
            //1.从cookie中提取购物车
            List<Cart> cartList = findCartList();

            //2.调用服务方法操作购物车
            cartList = cartService.addGoodsToCartList(cartList, itemId, num);

            if(name.equals("anonymousUser")){ //如果未登录
                //3.将新的购物车存入cookie
                String cartListString = JSON.toJSONString(cartList);
                CookieUtil.setCookie(request,response,"cartList",cartListString,3600*24,"UTF-8");
                System.out.println("向cookie中存储购物车");
            }else { //如果已登录
                cartService.saveCartListToRedis(name,cartList);
            }

            return new Result( true,"存入购物车成功");
        } catch (Exception e) {
            e.printStackTrace();
            return new Result( false,"存入购物车失败");
        }
    }

  /* @RequestMapping("/a")
   public String a(){
       return "a";

   }*/
    @RequestMapping("/findCartList")
    public List<Cart> findCartList(){

        //当前登录人账号
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("当前登录人："+username);

        //从cookie中提取购物车
        String cartListString = CookieUtil.getCookieValue(request, "cartList", "UTF-8");
        if(cartListString == null || cartListString.equals("")){
            cartListString = "[]";
        }

        List<Cart> cartList_cookie = JSON.parseArray(cartListString, Cart.class);

        if(username.equals("anonymousUser")){ //如果未登录

            System.out.println("从cookie中提取购物车");

            return cartList_cookie;

        }else{//如果已登录
            //获取redis购物车
            List<Cart> cartList_redis = cartService.findCartListFromRedis(username);

            //判断当本地购物车中存在数据，才会去进行两个购物车的合并
            if(cartList_cookie.size() > 0){

                //合并购物车
                List<Cart> mergeCartList = cartService.mergeCartList(cartList_cookie, cartList_redis);
                //将合并后的购物车存入redis
                cartService.saveCartListToRedis(username,mergeCartList);

                //清除本地购物车
                CookieUtil.deleteCookie(request,response,"cartList");
                System.out.println("执行了合并购物车逻辑");
                return mergeCartList;
            }

            return cartList_redis;
        }


    }

}
