<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        table,form,h1{
            text-align: center;
            margin: auto;
        }
        body{
            background: linear-gradient(180deg,#fff 0%,#9a9 100%) no-repeat fixed;
        }
        table{
            backdrop-filter:blur(1px);
        }
        table td,
        table th{
            background-color: #eee7;
        }
        
        table input{
            background-color: #eee;
            border: 1px solid #aaa;
        }
        table input:focus-visible{
            border: 1px solid #000;
            outline: none;
        }
        button{
            padding: 5px 10px;
        }
        form>button,form>a>button{
            width: 100px;
            margin: 36px;
        }
        h1{
            margin-top: 5%;
            padding: 24px;
        }
        form>div{
            padding: 12px;
        }
        td>input{
            width: 95%;
            height: 100%;
        }
        table,td,th{
            border: 1px solid #999;
            border-radius: 4px;
            padding: 2px 5px;
        }
        th{
            padding: 10px 5px;
        }
        form>div label,
        form>div input{
            font-size: 24px;
        }
        div
    </style>
</head>
<body>
<?php
$dbname="rehow_000";
$tbname="students_000";
/* (\$[^[, =)(&-?\]"!]*)  $1_000 */
$rown =["uid_000","username_000","password_000","classname_000","number_000"];
define("rownidx", sizeof($rown)-1);
$rown+=["id"=>$rown[0],"usn"=>$rown[1],"pwd"=>$rown[2],"class"=>$rown[3],"no"=>$rown[4],
"pwdnd"=>$rown[2]."nd"];
$conn=null;
if($conn=new mysqli("localhost","root","")){   
    try {
        $conn->query("USE $dbname");
    } catch (\Throwable $th) {
        $conn->query("CREATE DATABASE $dbname");
        $conn->query("USE $dbname");
    }
    try {
        $conn->query("SELECT * FROM $tbname");
    } catch (\Throwable $th) {
        $conn->query(<<<end
        CREATE TABLE $tbname(
            $rown[0]	int NOT NULL PRIMARY KEY AUTO_INCREMENT,
            $rown[1]	varchar(100),
            $rown[2]	varchar(100),
            $rown[3]	varchar(100),
            $rown[4]	varchar(12) UNIQUE
        )
        end);
    }
    if($conn->query("SELECT * FROM $tbname")->num_rows==0){
        $conn->query(<<<end
        INSERT INTO $tbname
            (`$rown[1]`, `$rown[2]`, `$rown[3]`,`$rown[4]`) VALUES 
            ('rehow','000000','20软件技术1班','202005070000'),
            ('xiaomin','000000','20软件技术1班','202005070199'),
            ('xiaogan','000000','20软件技术1班','202005070198'),
            ('blank','000000','20软件技术1班','202005070191')
        end);
    }
}
?>
<?php
$msg="";
$page=@$_REQUEST["page"];
$action=@$_REQUEST["action"];
$id=@$_REQUEST[$rown["id"]];
$usn=@$_POST[$rown["usn"]];
$pwd=@$_POST[$rown["pwd"]];
$pwdnd=@$_POST[$rown["pwdnd"]];
$class=@$_POST[$rown["class"]];
$no=@$_POST[$rown["no"]];
switch ($action) {
    case "login":
        setcookie($rown["usn"],$usn,time()+31536000);
        setcookie($rown["pwd"],$pwd,time()+31536000);
        //header("location:?page=home");
    break;
    case "logout":
        setcookie($rown["usn"],'',0);
        setcookie($rown["pwd"],'',0);
    break;
    case "register":
        $msg="注册失败，未知原因";
       if( 
            (!(isset($usn,$pwd,$pwdnd,$class,$no)&&$pwd===$pwdnd))&& !($page=="home"&&getUser())
        ){
            $msg="注册失败，值不能为空，或两次密码不一致";
        }
        elseif($page=="register"||$page=="home"){
            $stmt=$conn->prepare("INSERT INTO $tbname($rown[usn],$rown[pwd],$rown[class],$rown[no]) VALUES (?,?,?,?)");
            $stmt->bind_param("ssss",$usn,$pwd,$class,$no);
            try{
                $stmt->execute();
                $msg=$page==="home"?"创建成功":"注册成功，请登录";
            }catch(\Throwable $th){
                $msg=$page==="home"?"创建失败，检查学号是否重复":"注册成功，请登录";
            }
            $stmt->close();
        }
    break;
    case "drop":
        if(getUser()){
            $stmt=$conn->prepare("DELETE FROM $tbname WHERE $rown[id]=?");
            $stmt->bind_param("s",$id);
            if($stmt->execute()&&$stmt->affected_rows){
                $msg="删除成功";
            }else{
                $msg="删除失败";
            }
            $stmt->close();
        }
    break;
    case "modify":
        if($pwd!==$pwdnd){
            $msg="两次密码不一致";
        }elseif(getUser()){
            $stmt=$conn->prepare("UPDATE $tbname SET $rown[usn]=?,$rown[pwd]=?,$rown[class]=?,$rown[no]=? WHERE $rown[id]=?");
            $stmt->bind_param("sssss",$usn,$pwd,$class,$no,$id);
            if($stmt->execute()&&$stmt->affected_rows){
                $msg="修改成功";
            }else{
                $msg="修改失败";
            }
            $stmt->close();
        }
    break;
    default:
    break;
}
function getUser(){
    global $action,$rown,$conn,$tbname;
    $username=@$_COOKIE[$rown["usn"]];
    $password=@$_COOKIE[$rown["pwd"]];
    if($action=="login"){
        global $usn,$pwd;
        $username=$usn;
        $password=$pwd;
    }
    if($username&&$password){
        $stmt=$conn->prepare("SELECT * FROM $tbname WHERE $rown[usn]=? && $rown[pwd]=?");
        $stmt->bind_param("ss",$username,$password);
        if($stmt->execute() && $stmt->fetch() &&$stmt->close()){  
            return $username;
        }
        $stmt->close();
    }
    return false;
}

?>
<!-- Page Render -->
<?php switch ($page):case 'home'?>
    <?php if($user=getUser()):?>
    <h1>管理</h1>
    
    <form action="?page=home" method="post">
    <table>
        <thead>
            <tr><td>操作提示</td><td colspan="<?=rownidx-1?>"><?=$msg?$msg:"无操作"?></td><td>当前登录用户：<?=$user?></td><td><a onclick="return confirm('是否登出？')" href="?page=login&action=logout">登出</a></td></tr>
            <tr>
                <td>筛选条件</td>
                <td><select name="condition">
                    <?php for($i=0;$i<=rownidx;++$i):?>
                        <option value="<?=$i?>"><?=$rown[$i]?></option>
                    <?php endfor?>
                </select></td>
                <td colspan="<?=rownidx-1?>">
                    <input type="text" name="keyword" placeholder="请输入关键字（模糊查找，留空复原）">
                </td>
                <td><button style="width:100%" type="submit" name="action" value="search">搜索</button></td>
            </tr>
            <tr>
                <?php for($i=0;$i<=rownidx;++$i):?>
                <th><?=$rown[$i]?></th>
                <?php endfor?>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $stmt=null;
            $condition=@$_POST["condition"];
            $keyword=@$_POST["keyword"];

            if( isset($condition) && $keyword && $action=="search"){
                $stmt=$conn->prepare("SELECT * FROM $tbname WHERE $rown[$condition] LIKE ?");
                #$type=$rown[$condition]==$rown["id"]?'d':'s';
		$keyword="%".$keyword."%";
                $stmt->bind_param("s",$keyword);
            }else{
                $stmt=$conn->prepare("SELECT * FROM $tbname");
            }
                if($stmt->execute() && $result=$stmt->get_result()):
                    while($row=$result->fetch_assoc()):?>
            <tr>
                <?php for($i=0;$i<=rownidx;++$i):?>
                <td><?=$row[$rown[$i]]?></td>
                <?php endfor;?>
                <td><a href="?action=drop&page=home&<?=$rown['id']?>=<?=$row[$rown["id"]]?>"><button type="button">删除</button></a><a href="?page=modify&<?=$rown["id"]?>=<?=$row[$rown["id"]]?>"><button type="button">修改</button></a></td>
            </tr>

        <?php endwhile;
                $stmt->close();
        endif;?>
        
            <tr>
                <td style="color:#575">
                    自动生成
                </td>
                <td>
                    <input id="<?=$rown["usn"]?>" type="text" name="<?=$rown["usn"]?>" placeholder="请输入姓名" value=""/>
                </td>
                <td>
                    <input id="<?=$rown["pwd"]?>" type="password" name="<?=$rown["pwd"]?>" placeholder="请输入新密码" value=""/>
                </td>
                <td>
                    <input id="<?=$rown["class"]?>" type="text" name="<?=$rown["class"]?>" placeholder="请输入班级" value=""/>
                </td>
                <td>
                    <input id="<?=$rown["no"]?>" type="text" name="<?=$rown["no"]?>" placeholder="请输入学号（确保唯一）" value=""/>
                </td>
                <td>
                    <button style="width:100%" type="submit" name="action" value="register">创建</button>
                </td>
            </tr>
        </tbody>
    </table>
    
    </form>
    <?php else:header("location:?page=login");?>//home校验失败
    <?php endif;?>
<?php break;case 'modify':?>
    <?php 
    $stmt=$conn->prepare("SELECT * FROM $tbname WHERE $rown[id]=?");
    $stmt->bind_param("s",$id);
    $stmt->execute();
    $result=$stmt->get_result()->fetch_assoc();
    $stmt->close();
        if(isset($id) && getUser()): ?>
    <h1>修改</h1>
    <form action="?page=home" method="post">
        <div><label for="<?=$rown["id"]?>">序号：</label><input id="<?=$rown["id"]?>" type="text" name="<?=$rown["id"]?>" placeholder="请不要修改序号" readonly value="<?=$result[$rown["id"]]?>"></div>
        <div><label for="<?=$rown["usn"]?>">姓名：</label><input id="<?=$rown["usn"]?>" type="text" name="<?=$rown["usn"]?>" placeholder="请输入姓名" value="<?=$result[$rown["usn"]]?>"></div>
        <div><label for="<?=$rown["pwd"]?>">密码：</label><input id="<?=$rown["pwd"]?>" type="password" name="<?=$rown["pwd"]?>" placeholder="请输入新密码" value="<?=$result[$rown["pwd"]]?>"></div>
        <div><label for="<?=$rown["pwdnd"]?>">确认：</label><input id="<?=$rown["pwdnd"]?>" type="password" name="<?=$rown["pwdnd"]?>" placeholder="请输入再次密码" value="<?=$result[$rown["pwd"]]?>"></div>
        <div><label for="<?=$rown["no"]?>">学号：</label><input id="<?=$rown["no"]?>" type="text" name="<?=$rown["no"]?>" placeholder="请输入学号" value="<?=$result[$rown["no"]]?>"></div>
        <div><label for="<?=$rown["class"]?>">班级：</label><input id="<?=$rown["class"]?>" type="text" name="<?=$rown["class"]?>" placeholder="请输入班级" value="<?=$result[$rown["class"]]?>"></div>
        <a href="?page=home"><button type="button">返回</button></a>
        <button type="submit" name="action" value="modify">修改</button>
    </form>
    <?php endif ?>
<?php break;case 'register':?>
    <h1>注册</h1>
    <form action="?page=login" method="post">
        <div><label for="<?=$rown["usn"]?>">姓名：</label><input id="<?=$rown["usn"]?>" type="text" name="<?=$rown["usn"]?>" placeholder="请输入姓名"></div>
        <div><label for="<?=$rown["pwd"]?>">密码：</label><input id="<?=$rown["pwd"]?>" type="password" name="<?=$rown["pwd"]?>" placeholder="请输入密码"></div>
        <div><label for="<?=$rown["pwdnd"]?>">确认：</label><input id="<?=$rown["pwdnd"]?>" type="password" name="<?=$rown["pwdnd"]?>" placeholder="请输入再次密码"></div>
        <div><label for="<?=$rown["no"]?>">学号：</label><input id="<?=$rown["no"]?>" type="text" name="<?=$rown["no"]?>" placeholder="请输入学号"></div>
        <div><label for="<?=$rown["class"]?>">班级：</label><input id="<?=$rown["class"]?>" type="text" name="<?=$rown["class"]?>" placeholder="请输入班级"></div>
        <a href="?page=login"><button type="button">返回</button></a>
        <button type="submit" name="action" value="register">注册</button>
    </form>
<?php break;case 'debug':?>
    <h1>调试</h1>
    <table>
        <thead>
            <?php for($i=0;$i<=rownidx;++$i):?>
            <th><?=$rown[$i]?></th>
            <?php endfor?>
        </thead>
        <tbody>
            <?php if($result=$conn->query("SELECT * FROM $tbname")):
            while($row=$result->fetch_assoc()):
                echo"<tr>";
                for($i=0;$i<=rownidx;++$i):?>
                <td><?=$row[$rown[$i]]?></td>
                <?php
                endfor;echo"</tr>";
            endwhile;
        endif;?>
        </tbody>
    </table>
<?php break;case 'logout':case 'login':default:?>
    <h1>登录</h1>
    <form action="?page=home" method="post">
        <p><?=$msg?></p>
        <div><label for="<?=$rown["usn"]?>">姓名：</label><input id="<?=$rown["usn"]?>" type="text" name="<?=$rown["usn"]?>" placeholder="请输入姓名" value="rehow"></div>
        <div><label for="<?=$rown["pwd"]?>">密码：</label><input id="<?=$rown["pwd"]?>" type="password" name="<?=$rown["pwd"]?>" placeholder="请输入密码" value="000000"></div>
        <button type="submit" name="action" value="login">登录</button>
        <a href="?page=register"><button type="button">注册</button></a>
    </form>
<?php break;endswitch ?>

<?php $conn->close() ?>
</body>
</html>