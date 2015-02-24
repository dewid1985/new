<?php

class newClass
{

    protected $result = array();

    protected $str;

    protected $result_str;

    static function create()
    {
        return new static();
    }


    public function index()
    {
        $array = ['top', 'top.help', 'top.help.name', 'top.help.name.dewid', 'top.help.first_name', 'top.info', 'top.info.information', 'top.game'];

        foreach ($array as $k => $v) {
            echo $this->prepare($v) . "</br>";
        }
    }

    public function prepare($v)
    {

        $this->result_str = "";

        $this->result[$v] = $v;
        if (count($this->result) == 1) {
            return '|--' . $v;
        }

        for ($i = 1; $i <= count(explode(".", $v)); $i++) {
            if ($i > count(explode(".", $v)) - 1) {
                $this->result_str .= "|--";
            } else {
                $this->result_str .= "|&nbsp&nbsp";
            };
        }

        return $this->result_srt . $v;
        //echo  count(explode(".",$v));

    }
}

newClass::create()->index();
