import React, { useState } from 'react';

function PrivateNotes() {
  /* ========================================================================
  VÙNG 1: STATE
  ======================================================================== */

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [notes, setNotes] = useState([]);

  // Tìm kiếm
  const [search, setSearch] = useState('');

  // Form thêm / sửa
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    content: ''
  });

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Số note hiển thị trên mỗi trang
  const notesPerPage = 6;

  /* ========================================================================
  VÙNG 2: LOGIC
  ======================================================================== */

  // Đăng nhập
  const handleLogin = () => {
    fetch('http://localhost:5000/api/private/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: passwordInput
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsUnlocked(true);
          fetchPrivateNotes();
        } else {
          alert('Sai mật khẩu, vui lòng thử lại!');
          setPasswordInput('');
        }
      })
      .catch(error => {
        console.error(error);
        alert('Không thể kết nối đến server!');
      });
  };

  // Lấy danh sách note
  const fetchPrivateNotes = () => {
    fetch('http://localhost:5000/api/private/notes')
      .then(res => res.json())
      .then(data => {
        setNotes(data);
        setCurrentPage(1);
      })
      .catch(error => {
        console.error(error);
        alert('Không thể lấy danh sách ghi chú!');
      });
  };

  /* ========================================================================
  THÊM / SỬA
  ======================================================================== */

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    const isEditing = formData.id !== null;

    const url = isEditing
      ? `http://localhost:5000/api/private/notes/${formData.id}`
      : 'http://localhost:5000/api/private/notes';

    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: formData.title,
        content: formData.content
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Lưu thất bại');
        }

        return res.json();
      })
      .then(() => {
        fetchPrivateNotes();

        setFormData({
          id: null,
          title: '',
          content: ''
        });

        alert(
          isEditing
            ? 'Đã cập nhật ghi chú!'
            : 'Đã thêm ghi chú!'
        );
      })
      .catch(error => {
        console.error(error);
        alert('Có lỗi xảy ra khi lưu ghi chú!');
      });
  };

  /* ========================================================================
  SỬA
  ======================================================================== */

  const handleEdit = (note) => {
    setFormData({
      id: note.id,
      title: note.title,
      content: note.content
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  /* ========================================================================
  HỦY SỬA
  ======================================================================== */

  const handleCancelEdit = () => {
    setFormData({
      id: null,
      title: '',
      content: ''
    });
  };

  /* ========================================================================
  XÓA
  ======================================================================== */

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa ghi chú bí mật này không?'
    );

    if (!confirmed) {
      return;
    }

    fetch(`http://localhost:5000/api/private/notes/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Xóa thất bại');
        }

        return res.json();
      })
      .then(() => {
        fetchPrivateNotes();

        if (formData.id === id) {
          handleCancelEdit();
        }

        alert('Đã xóa ghi chú!');
      })
      .catch(error => {
        console.error(error);
        alert('Có lỗi xảy ra khi xóa ghi chú!');
      });
  };

  /* ========================================================================
  VÙNG 3: TÌM KIẾM
  ======================================================================== */

  const filteredNotes = notes.filter(note => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return true;
    }

    return (
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword)
    );
  });

  /* ========================================================================
  VÙNG 4: PHÂN TRANG
  ======================================================================== */

  // Tổng số trang
  const totalPages = Math.ceil(
    filteredNotes.length / notesPerPage
  );

  // Vị trí bắt đầu
  const startIndex =
    (currentPage - 1) * notesPerPage;

  // Lấy note của trang hiện tại
  const currentNotes = filteredNotes.slice(
    startIndex,
    startIndex + notesPerPage
  );

  /* ========================================================================
  XỬ LÝ KHI TÌM KIẾM
  ======================================================================== */

  const handleSearch = (value) => {
    setSearch(value);

    // Khi tìm kiếm thì quay về trang 1
    setCurrentPage(1);
  };

  /* ========================================================================
  CHUYỂN TRANG
  ======================================================================== */

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  /* ========================================================================
  VÙNG 5: MÀN HÌNH ĐĂNG NHẬP
  ======================================================================== */

  if (!isUnlocked) {
    return (
      <div
        style={{
          padding: '50px',
          textAlign: 'center'
        }}
      >
        <h2>Khu vực Bảo mật 🔒</h2>

        <p>
          Vui lòng nhập mật khẩu để truy cập
        </p>

        <input
          type="password"
          value={passwordInput}
          onChange={(e) =>
            setPasswordInput(e.target.value)
          }
          placeholder="Nhập mật khẩu..."
        />

        <button
          onClick={handleLogin}
          style={{
            marginLeft: '10px'
          }}
        >
          Mở khóa
        </button>
      </div>
    );
  }

  /* ========================================================================
  VÙNG 6: GIAO DIỆN
  ======================================================================== */

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#ffebee',
        minHeight: '100vh'
      }}
    >
      <h2 style={{ color: 'red' }}>
        Khu vực Ghi chú Riêng tư 🔒
      </h2>

      {/* ====================================================================
      TÌM KIẾM
      ==================================================================== */}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm ghi chú bí mật..."
          value={search}
          onChange={(e) =>
            handleSearch(e.target.value)
          }
          style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid red',
            borderRadius: '5px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* ====================================================================
      FORM THÊM / SỬA
      ==================================================================== */}

      <div
        style={{
          border: '1px solid red',
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#fff'
        }}
      >
        <h3>
          {formData.id
            ? 'Sửa ghi chú bí mật'
            : ' Thêm ghi chú bí mật'}
        </h3>

        <input
          placeholder="Tiêu đề bí mật"
          value={formData.title}
          onChange={(e) =>
            setFormData({
              ...formData,
              title: e.target.value
            })
          }
          style={{
            display: 'block',
            width: '100%',
            marginBottom: '10px',
            padding: '8px',
            boxSizing: 'border-box'
          }}
        />

        <textarea
          placeholder="Nội dung bí mật"
          value={formData.content}
          onChange={(e) =>
            setFormData({
              ...formData,
              content: e.target.value
            })
          }
          style={{
            display: 'block',
            width: '100%',
            height: '100px',
            marginBottom: '10px',
            padding: '8px',
            boxSizing: 'border-box'
          }}
        />

        <button
          onClick={handleSave}
          style={{
            backgroundColor: formData.id
              ? '#007bff'
              : 'red',
            color: 'white',
            padding: '8px 15px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {formData.id
            ? ' Cập nhật'
            : ' Lưu bí mật'}
        </button>

        {formData.id && (
          <button
            onClick={handleCancelEdit}
            style={{
              marginLeft: '10px',
              padding: '8px 15px',
              cursor: 'pointer'
            }}
          >
             Hủy
          </button>
        )}
      </div>

      {/* ====================================================================
      THÔNG TIN TÌM KIẾM
      ==================================================================== */}

      <div
        style={{
          marginBottom: '15px'
        }}
      >
        {search ? (
          <p>
            Tìm thấy{' '}
            <strong>{filteredNotes.length}</strong>{' '}
            ghi chú với từ khóa{' '}
            <strong>"{search}"</strong>
          </p>
        ) : (
          <p>
            Tổng cộng:{' '}
            <strong>{notes.length}</strong>{' '}
            ghi chú
          </p>
        )}
      </div>

      {/* ====================================================================
      DANH SÁCH NOTE CỦA TRANG HIỆN TẠI
      ==================================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px'
        }}
      >
        {currentNotes.length === 0 && (
          <p>
            {search
              ? `Không tìm thấy ghi chú nào với từ khóa "${search}".`
              : 'Chưa có ghi chú riêng tư nào.'}
          </p>
        )}

        {currentNotes.map(note => (
          <div
            key={note.id}
            style={{
              border: '1px solid red',
              padding: '15px',
              borderRadius: '5px',
              backgroundColor: 'white'
            }}
          >
            <h4 style={{ marginTop: 0 }}>
              {note.title}
            </h4>

            <p
              style={{
                whiteSpace: 'pre-wrap'
              }}
            >
              {note.content}
            </p>

            {/* Nút Sửa */}
            <button
              onClick={() => handleEdit(note)}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '7px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
               Sửa
            </button>

            {/* Nút Xóa */}
            <button
              onClick={() => handleDelete(note.id)}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '7px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
               Xóa
            </button>
          </div>
        ))}
      </div>

      {/* ====================================================================
      PHÂN TRANG
      ==================================================================== */}

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px',
            marginTop: '30px',
            paddingBottom: '20px'
          }}
        >
          {/* Trang trước */}
          <button
            onClick={() =>
              goToPage(currentPage - 1)
            }
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              cursor:
                currentPage === 1
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                currentPage === 1 ? 0.5 : 1
            }}
          >
            Trước
          </button>

          {/* Các số trang */}
          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',

                backgroundColor:
                  currentPage === page
                    ? 'red'
                    : 'white',

                color:
                  currentPage === page
                    ? 'white'
                    : 'black',

                fontWeight:
                  currentPage === page
                    ? 'bold'
                    : 'normal'
              }}
            >
              {page}
            </button>
          ))}

          {/* Trang sau */}
          <button
            onClick={() =>
              goToPage(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              cursor:
                currentPage === totalPages
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                currentPage === totalPages
                  ? 0.5
                  : 1
            }}
          >
            Sau 
          </button>
        </div>
      )}

      {/* Thông tin trang */}
      {totalPages > 0 && (
        <p
          style={{
            textAlign: 'center',
            color: '#666'
          }}
        >
          Trang {currentPage} / {totalPages}
        </p>
      )}
    </div>
  );
}

export default PrivateNotes;