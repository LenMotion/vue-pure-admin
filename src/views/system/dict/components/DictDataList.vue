<script setup lang="tsx">
import { ref, onMounted, watch, h } from "vue";
import {
  getDictDataListApi,
  DictDataModel,
  saveOrUpdateDictDataApi,
  delDictDataApi,
  updateDictDataStatusApi
} from "@/api/system/dict";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";
import { deviceDetection } from "@pureadmin/utils";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import dayjs from "dayjs";
import type { PaginationProps } from "@pureadmin/table";
import DictDataForm from "./DictDataForm.vue";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import AddFill from "~icons/ri/add-circle-line";

const props = defineProps<{
  dictKey: string;
}>();

const loading = ref(true);
const dataList = ref<DictDataModel[]>([]);
const tableRef = ref();
const formRef = ref();
const switchLoadMap = ref({});
const { switchStyle } = usePublicHooks();

const pagination = ref<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const columns: TableColumnList = [
  {
    label: "序号",
    type: "index",
    width: 90,
    index: (index: number) =>
      (pagination.value.currentPage - 1) * pagination.value.pageSize + index + 1
  },
  {
    label: "字典标签",
    prop: "dictLabel",
    minWidth: 120
  },
  {
    label: "字典键值",
    prop: "dictValue",
    minWidth: 120
  },
  {
    label: "字典排序",
    prop: "dictSort",
    minWidth: 100
  },
  {
    label: "表格字典样式",
    prop: "listClass",
    minWidth: 120
  },
  {
    label: "状态",
    cellRenderer: scope => (
      <el-switch
        size={scope.props.size === "small" ? "small" : "default"}
        loading={switchLoadMap.value[scope.index]?.loading}
        v-model={scope.row.status}
        active-value="0"
        inactive-value="1"
        active-text="已启用"
        inactive-text="已停用"
        inline-prompt
        style={switchStyle.value}
        onChange={() => onChange(scope as any)}
      />
    ),
    minWidth: 90
  },
  {
    label: "备注",
    prop: "remark",
    minWidth: 160
  },
  {
    label: "创建时间",
    prop: "createTime",
    minWidth: 160,
    formatter: ({ createTime }) =>
      createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : ""
  },
  {
    label: "操作",
    fixed: "right",
    width: 140,
    slot: "operation"
  }
];

async function loadData() {
  if (!props.dictKey) return;

  loading.value = true;
  try {
    const { result } = await getDictDataListApi({
      dictKey: props.dictKey,
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    });
    dataList.value = result.items;
    pagination.value.total = result.total;
    pagination.value.pageSize = result.pageSize;
    pagination.value.currentPage = result.pageNum;
  } finally {
    loading.value = false;
  }
}

function handleSizeChange(val: number) {
  pagination.value.pageSize = val;
  pagination.value.currentPage = 1;
  loadData();
}

function handleCurrentChange(val: number) {
  pagination.value.currentPage = val;
  loadData();
}

watch(
  () => props.dictKey,
  () => {
    if (props.dictKey) {
      pagination.value.currentPage = 1;
      loadData();
    }
  },
  { immediate: true }
);

function onChange({ row, index }) {
  // 保存旧状态，因为 switch 点击后 row.status 已经是新值了
  const oldStatus = row.status === "0" ? "1" : "0";
  const newStatus = row.status;
  const action = newStatus === "0" ? "启用" : "停用";

  ElMessageBox.confirm(
    `确认要<strong>${action}</strong><strong style='color:var(--el-color-primary)'>${
      row.dictLabel
    }</strong>吗?`,
    "系统提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      dangerouslyUseHTMLString: true,
      draggable: true
    }
  )
    .then(async () => {
      switchLoadMap.value[index] = Object.assign(
        {},
        switchLoadMap.value[index],
        {
          loading: true
        }
      );
      await updateDictDataStatusApi({ id: row.id, status: newStatus });
      setTimeout(() => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: false
          }
        );
        message(`已${action}${row.dictLabel}`, {
          type: "success"
        });
      }, 300);
    })
    .catch(() => {
      // 取消操作，恢复原状态
      row.status = oldStatus;
    });
}

function handleDelete(row: DictDataModel) {
  delDictDataApi(row.id).then(res => {
    if (res.code === 200) {
      message(`您删除了字典标签为${row.dictLabel}的这条数据`, {
        type: "success"
      });
      loadData();
    }
  });
}

function openDialog(title = "新增", row?: DictDataModel) {
  addDialog({
    title: `${title}字典数据`,
    props: {
      formInline: {
        dictKey: row?.dictKey ?? props.dictKey,
        dictLabel: row?.dictLabel ?? "",
        dictValue: row?.dictValue ?? "",
        dictSort: row?.dictSort ?? 0,
        listClass: row?.listClass ?? "",
        status: title === "新增" ? undefined : (row?.status ?? "0"),
        remark: row?.remark ?? "",
        id: row?.id
      }
    },
    width: "40%",
    draggable: true,
    fullscreen: deviceDetection(),
    fullscreenIcon: true,
    closeOnClickModal: false,
    contentRenderer: () => h(DictDataForm, { ref: formRef, formInline: null }),
    beforeSure: (done, { options }) => {
      const FormRef = formRef.value.getRef();
      const curData = options.props.formInline as DictDataModel;
      function chores() {
        message(`您${title}了字典标签为${curData.dictLabel}的这条数据`, {
          type: "success"
        });
        done();
        loadData();
      }
      FormRef.validate(valid => {
        if (valid) {
          const apiData = {
            ...curData,
            id: title === "修改" ? row?.id : undefined,
            // 新增时如果没有 status，使用默认值"0"
            status: curData.status ?? "0"
          };
          saveOrUpdateDictDataApi(apiData).then(res => {
            if (res.code === 200) {
              chores();
            }
          });
        }
      });
    }
  });
}

onMounted(() => {
  if (props.dictKey) {
    loadData();
  }
});
</script>

<template>
  <div>
    <PureTableBar
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="loadData"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新增字典数据
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 45 }"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="{ ...pagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('修改', row)"
            >
              修改
            </el-button>
            <el-popconfirm
              :title="`是否确认删除字典标签为${row.dictLabel}的这条数据`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="danger"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>
